// SPDX-License-Identifier: GPL-3.0-or-later

#include "aclk_util.h"

#include <stdio.h>

#include "../daemon/common.h"

// CentOS 7 has older version that doesn't define this
// same goes for MacOS
#ifndef UUID_STR_LEN
#define UUID_STR_LEN 37
#endif

aclk_encoding_type_t aclk_encoding_type_t_from_str(const char *str) {
    if (!strcmp(str, "json")) {
        return ACLK_ENC_JSON;
    }
    if (!strcmp(str, "proto")) {
        return ACLK_ENC_PROTO;
    }
    return ACLK_ENC_UNKNOWN;
}

aclk_transport_type_t aclk_transport_type_t_from_str(const char *str) {
    if (!strcmp(str, "MQTTv3")) {
        return ACLK_TRP_MQTT_3_1_1;
    }
    if (!strcmp(str, "MQTTv5")) {
        return ACLK_TRP_MQTT_5;
    }
    return ACLK_TRP_UNKNOWN;
}

void aclk_transport_desc_t_destroy(aclk_transport_desc_t *trp_desc) {
    freez(trp_desc->endpoint);
}

void aclk_env_t_destroy(aclk_env_t *env) {
    freez(env->auth_endpoint);
    if (env->transports) {
        for (size_t i = 0; i < env->transport_count; i++) {
            if(env->transports[i]) {
                aclk_transport_desc_t_destroy(env->transports[i]);
                env->transports[i] = NULL;
            }
        }
        freez(env->transports);
    }
    if (env->capabilities) {
        for (size_t i = 0; i < env->capability_count; i++)
            freez(env->capabilities[i]);
        freez(env->capabilities);
    }
}

#ifdef ACLK_LOG_CONVERSATION_DIR
volatile int aclk_conversation_log_counter = 0;
#if !defined(HAVE_C___ATOMIC) || defined(NETDATA_NO_ATOMIC_INSTRUCTIONS)
netdata_mutex_t aclk_conversation_log_mutex = NETDATA_MUTEX_INITIALIZER;
int aclk_get_conv_log_next()
{
    int ret;
    netdata_mutex_lock(&aclk_conversation_log_mutex);
    ret = aclk_conversation_log_counter++;
    netdata_mutex_unlock(&aclk_conversation_log_mutex);
    return ret;
}
#endif
#endif

#define ACLK_TOPIC_PREFIX "/agent/"

struct aclk_topic {
    const char *topic_suffix;
    char *topic;
};

// This helps to cache finalized topics (assembled with claim_id)
// to not have to alloc or create buffer and construct topic every
// time message is sent as in old ACLK
static struct aclk_topic aclk_topic_cache[] = {
    { .topic_suffix = "outbound/meta",   .topic = NULL }, // ACLK_TOPICID_CHART
    { .topic_suffix = "outbound/alarms", .topic = NULL }, // ACLK_TOPICID_ALARMS
    { .topic_suffix = "outbound/meta",   .topic = NULL }, // ACLK_TOPICID_METADATA
    { .topic_suffix = "inbound/cmd",     .topic = NULL }, // ACLK_TOPICID_COMMAND
    { .topic_suffix = NULL,              .topic = NULL }
};

void free_topic_cache(void)
{
    struct aclk_topic *tc = aclk_topic_cache;
    while (tc->topic_suffix) {
        if (tc->topic) {
            freez(tc->topic);
            tc->topic = NULL;
        }
        tc++;
    }
}

static inline void generate_topic_cache(void)
{
    struct aclk_topic *tc = aclk_topic_cache;
    char *ptr;
    if (unlikely(!tc->topic)) {
        rrdhost_aclk_state_lock(localhost);
        while(tc->topic_suffix) {
            tc->topic = mallocz(strlen(ACLK_TOPIC_PREFIX) + (UUID_STR_LEN - 1) + 2 /* '/' and \0 */ + strlen(tc->topic_suffix));
            ptr = tc->topic;
            strcpy(ptr, ACLK_TOPIC_PREFIX);
            ptr += strlen(ACLK_TOPIC_PREFIX);
            strcpy(ptr, localhost->aclk_state.claimed_id);
            ptr += (UUID_STR_LEN - 1);
            *ptr++ = '/';
            strcpy(ptr, tc->topic_suffix);
            tc++;
        }
        rrdhost_aclk_state_unlock(localhost);
    }
}

/*
 * Build a topic based on sub_topic and final_topic
 * if the sub topic starts with / assume that is an absolute topic
 *
 */
const char *aclk_get_topic(enum aclk_topics topic)
{
    generate_topic_cache();

    return aclk_topic_cache[topic].topic;
}

/*
 * TBEB with randomness
 *
 * @param mode 0 - to reset the delay,
 *             1 - to advance a step and calculate sleep time [0 .. ACLK_MAX_BACKOFF_DELAY * 1000] ms
 * @returns delay in ms
 *
 */
#define ACLK_MAX_BACKOFF_DELAY 1024
unsigned long int aclk_reconnect_delay(int mode)
{
    static int fail = -1;
    unsigned long int delay;

    if (!mode || fail == -1) {
        srandom(time(NULL));
        fail = mode - 1;
        return 0;
    }

    delay = (1 << fail);

    if (delay >= ACLK_MAX_BACKOFF_DELAY) {
        delay = ACLK_MAX_BACKOFF_DELAY * 1000;
    } else {
        fail++;
        delay *= 1000;
        delay += (random() % (MAX(1000, delay/2)));
    }

    return delay;
}

#define ACLK_PROXY_PROTO_ADDR_SEPARATOR "://"
#define ACLK_PROXY_ENV "env"
#define ACLK_PROXY_CONFIG_VAR "proxy"

struct {
    ACLK_PROXY_TYPE type;
    const char *url_str;
} supported_proxy_types[] = {
    { .type = PROXY_TYPE_SOCKS5,   .url_str = "socks5"  ACLK_PROXY_PROTO_ADDR_SEPARATOR },
    { .type = PROXY_TYPE_SOCKS5,   .url_str = "socks5h" ACLK_PROXY_PROTO_ADDR_SEPARATOR },
    { .type = PROXY_TYPE_HTTP,     .url_str = "http"    ACLK_PROXY_PROTO_ADDR_SEPARATOR },
    { .type = PROXY_TYPE_UNKNOWN,  .url_str = NULL                                      },
};

const char *aclk_proxy_type_to_s(ACLK_PROXY_TYPE *type)
{
    switch (*type) {
        case PROXY_DISABLED:
            return "disabled";
        case PROXY_TYPE_HTTP:
            return "HTTP";
        case PROXY_TYPE_SOCKS5:
            return "SOCKS";
        default:
            return "Unknown";
    }
}

static inline ACLK_PROXY_TYPE aclk_find_proxy(const char *string)
{
    int i = 0;
    while (supported_proxy_types[i].url_str) {
        if (!strncmp(supported_proxy_types[i].url_str, string, strlen(supported_proxy_types[i].url_str)))
            return supported_proxy_types[i].type;
        i++;
    }
    return PROXY_TYPE_UNKNOWN;
}

ACLK_PROXY_TYPE aclk_verify_proxy(const char *string)
{
    if (!string)
        return PROXY_TYPE_UNKNOWN;

    while (*string == 0x20 && *string!=0)   // Help coverity (compiler will remove)
        string++;

    if (!*string)
        return PROXY_TYPE_UNKNOWN;

    return aclk_find_proxy(string);
}

// helper function to censor user&password
// for logging purposes
void safe_log_proxy_censor(char *proxy)
{
    size_t length = strlen(proxy);
    char *auth = proxy + length - 1;
    char *cur;

    while ((auth >= proxy) && (*auth != '@'))
        auth--;

    //if not found or @ is first char do nothing
    if (auth <= proxy)
        return;

    cur = strstr(proxy, ACLK_PROXY_PROTO_ADDR_SEPARATOR);
    if (!cur)
        cur = proxy;
    else
        cur += strlen(ACLK_PROXY_PROTO_ADDR_SEPARATOR);

    while (cur < auth) {
        *cur = 'X';
        cur++;
    }
}

static inline void safe_log_proxy_error(char *str, const char *proxy)
{
    char *log = strdupz(proxy);
    safe_log_proxy_censor(log);
    error("%s Provided Value:\"%s\"", str, log);
    freez(log);
}

static inline int check_socks_enviroment(const char **proxy)
{
    char *tmp = getenv("socks_proxy");

    if (!tmp)
        return 1;

    if (aclk_verify_proxy(tmp) == PROXY_TYPE_SOCKS5) {
        *proxy = tmp;
        return 0;
    }

    safe_log_proxy_error(
        "Environment var \"socks_proxy\" defined but of unknown format. Supported syntax: \"socks5[h]://[user:pass@]host:ip\".",
        tmp);
    return 1;
}

static inline int check_http_enviroment(const char **proxy)
{
    char *tmp = getenv("http_proxy");

    if (!tmp)
        return 1;

    if (aclk_verify_proxy(tmp) == PROXY_TYPE_HTTP) {
        *proxy = tmp;
        return 0;
    }

    safe_log_proxy_error(
        "Environment var \"http_proxy\" defined but of unknown format. Supported syntax: \"http[s]://[user:pass@]host:ip\".",
        tmp);
    return 1;
}

const char *aclk_lws_wss_get_proxy_setting(ACLK_PROXY_TYPE *type)
{
    const char *proxy = config_get(CONFIG_SECTION_CLOUD, ACLK_PROXY_CONFIG_VAR, ACLK_PROXY_ENV);
    *type = PROXY_DISABLED;

    if (strcmp(proxy, "none") == 0)
        return proxy;

    if (strcmp(proxy, ACLK_PROXY_ENV) == 0) {
        if (check_socks_enviroment(&proxy) == 0) {
#ifdef LWS_WITH_SOCKS5
            *type = PROXY_TYPE_SOCKS5;
            return proxy;
#else
            safe_log_proxy_error("socks_proxy environment variable set to use SOCKS5 proxy "
                "but Libwebsockets used doesn't have SOCKS5 support built in. "
                "Ignoring and checking for other options.",
                proxy);
#endif
        }
        if (check_http_enviroment(&proxy) == 0)
            *type = PROXY_TYPE_HTTP;
        return proxy;
    }

    *type = aclk_verify_proxy(proxy);
#ifndef LWS_WITH_SOCKS5
    if (*type == PROXY_TYPE_SOCKS5) {
        safe_log_proxy_error(
            "Config var \"" ACLK_PROXY_CONFIG_VAR
            "\" set to use SOCKS5 proxy but Libwebsockets used is built without support for SOCKS proxy. ACLK will be disabled.",
            proxy);
    }
#endif
    if (*type == PROXY_TYPE_UNKNOWN) {
        *type = PROXY_DISABLED;
        safe_log_proxy_error(
            "Config var \"" ACLK_PROXY_CONFIG_VAR
            "\" defined but of unknown format. Supported syntax: \"socks5[h]://[user:pass@]host:ip\".",
            proxy);
    }

    return proxy;
}

// helper function to read settings only once (static)
// as claiming, challenge/response and ACLK
// read the same thing, no need to parse again
const char *aclk_get_proxy(ACLK_PROXY_TYPE *type)
{
    static const char *proxy = NULL;
    static ACLK_PROXY_TYPE proxy_type = PROXY_NOT_SET;

    if (proxy_type == PROXY_NOT_SET)
        proxy = aclk_lws_wss_get_proxy_setting(&proxy_type);

    *type = proxy_type;
    return proxy;
}

#define HTTP_PROXY_PREFIX "http://"
void aclk_set_proxy(char **ohost, int *port, enum mqtt_wss_proxy_type *type)
{
    ACLK_PROXY_TYPE pt;
    const char *ptr = aclk_get_proxy(&pt);
    char *tmp;
    char *host;
    if (pt != PROXY_TYPE_HTTP)
        return;

    *port = 0;

    if (!strncmp(ptr, HTTP_PROXY_PREFIX, strlen(HTTP_PROXY_PREFIX)))
        ptr += strlen(HTTP_PROXY_PREFIX);

    if ((tmp = strchr(ptr, '@')))
        ptr = tmp;

    if ((tmp = strchr(ptr, '/'))) {
        host = mallocz((tmp - ptr) + 1);
        memcpy(host, ptr, (tmp - ptr));
        host[tmp - ptr] = 0;
    } else
        host = strdupz(ptr);

    if ((tmp = strchr(host, ':'))) {
        *tmp = 0;
        tmp++;
        *port = atoi(tmp);
    }

    if (*port <= 0 || *port > 65535)
        *port = 8080;

    *ohost = host;

    if (type)
        *type = MQTT_WSS_PROXY_HTTP;
}
