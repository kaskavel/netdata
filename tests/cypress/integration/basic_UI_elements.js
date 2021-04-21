/// <reference types="cypress" />

context('Assertions', () => {
  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl)
  })

  describe('Implicit Assertions', () => {
    it('.should() - Assert Presence of Basic Elements', () => {

        // Top Menu
        cy.get('h1#menu_system').contains('System Overview');
        cy.get('[title="Need help?"]')
        cy.get('[data-target="#saveSnapshotModal"][title="Export a snapshot"]')
        cy.get('[data-target="#loadSnapshotModal"][title="Import a snapshot"]')
        cy.get('[data-target="#printPreflightModal"][title="Print dashboard"]')
        cy.get('[data-target="#alarmsModal"][title="Alarms"]')
        cy.get('[data-target="#optionsModal"][title="Settings"]')

        // Assert presence of gauges
        cy.get('[data-title="Used Swap"][data-units="%"]')
        cy.get('[data-title="Disk Read"][data-common-units="system.io.mainhead"]')
        cy.get('[data-title="Disk Write"][data-common-units="system.io.mainhead"]')
        cy.get('[data-title="CPU"][data-units="%"]')
        cy.get('[data-title="IPv4 Inbound"][data-common-units="system.ipv4.mainhead"]')
        cy.get('[data-title="IPv4 Outbound"][data-common-units="system.ipv4.mainhead"]')
        cy.get('[data-title="Used RAM"][data-units="%"]')

        // Charts

        // CPU
        cy.get('h2#menu_system_submenu_cpu').contains('cpu');
        cy.get('[data-netdata="system.cpu"][id="chart_system_cpu"]')

        // Load
        cy.get('h2#menu_system_submenu_load').contains('load');
        cy.get('[data-netdata="system.load"][id="chart_system_load"]')

        // Disk
        cy.get('h2#menu_system_submenu_disk').contains('disk');
        cy.get('[data-netdata="system.io"][id="chart_system_io"]')

        // Ram
        cy.get('h2#menu_system_submenu_ram').contains('ram');
        cy.get('[data-netdata="system.ram"][id="chart_system_ram"]')

        // Swap
        cy.get('h2#menu_system_submenu_swap').contains('swap');
        cy.get('[data-netdata="system.swap"][id="chart_system_swap"]')
        cy.get('[data-netdata="system.swapio"][id="chart_system_swapio"]')

        // Network
        cy.get('h2#menu_system_submenu_network').contains('network');
        cy.get('[data-netdata="system.ipv4"][id="chart_system_ipv4"]')

        // Idlejitter
        cy.get('h2#menu_system_submenu_idlejitter').contains('idlejitter');
        cy.get('[data-netdata="system.idlejitter"][id="chart_system_idlejitter"]')

        // Uptime
        cy.get('h2#menu_system_submenu_uptime').contains('uptime');
        cy.get('[data-netdata="system.uptime"][id="chart_system_uptime"]')

        // Memory
        cy.get('h1#menu_mem').contains('Memory');
        cy.get('h2#menu_mem_submenu_system').contains('system');
        cy.get('[data-netdata="mem.pgfaults"][id="chart_mem_pgfaults"]')

        // Disks
        cy.get('h1#menu_disk').contains('Disks');
        cy.get('[data-netdata="disk.disk0"][data-dimensions="reads"]')
        cy.get('[data-netdata="disk.disk0"][data-dimensions="writes"]')
        cy.get('[data-netdata="disk_util.disk0"][data-dimensions]')

        cy.get('[data-netdata="disk.disk0"][id="chart_disk_disk0"]')
        cy.get('[data-netdata="disk_ops.disk0"][id="chart_disk_ops_disk0"]')
        cy.get('[data-netdata="disk_util.disk0"][id="chart_disk_util_disk0"]')
        cy.get('[data-netdata="disk_await.disk0"][id="chart_disk_await_disk0"]')
        cy.get('[data-netdata="disk_avgsz.disk0"][id="chart_disk_avgsz_disk0"]')
        cy.get('[data-netdata="disk_svctm.disk0"][id="chart_disk_svctm_disk0"]')
        cy.get('[data-netdata="disk_iotime.disk0"][id="chart_disk_iotime_disk0"]')
        cy.get('[data-netdata="disk_space./"][id="chart_disk_space__"]')
        cy.get('[data-netdata="disk_inodes./"][id="chart_disk_inodes__"]')

        // /System/Volumes/Data
        cy.get('h2#menu_disk_submenu__System_Volumes_Data').contains('/System/Volumes/Data');
        cy.get('[data-netdata="disk_space./System/Volumes/Data"][id="chart_disk_space__System_Volumes_Data"]')
        cy.get('[data-netdata="disk_inodes./System/Volumes/Data"][id="chart_disk_inodes__System_Volumes_Data"]')

        // /System/Volumes/Preboot
        cy.get('h2#menu_disk_submenu__System_Volumes_Preboot').contains('/System/Volumes/Preboot');
        cy.get('[data-netdata="disk_space./System/Volumes/Preboot"][id="chart_disk_space__System_Volumes_Preboot"]')
        cy.get('[data-netdata="disk_inodes./System/Volumes/Preboot"][id="chart_disk_inodes__System_Volumes_Preboot"]')

        // /System/Volumes/Update
        cy.get('h2#menu_disk_submenu__System_Volumes_Update').contains('/System/Volumes/Update');
        cy.get('[data-netdata="disk_space./System/Volumes/Update"][id="chart_disk_space__System_Volumes_Update"]')
        cy.get('[data-netdata="disk_inodes./System/Volumes/Update"][id="chart_disk_inodes__System_Volumes_Update"]')

        // /System/Volumes/VM
        cy.get('h2#menu_disk_submenu__System_Volumes_VM').contains('/System/Volumes/VM');
        cy.get('[data-netdata="disk_space./System/Volumes/VM"][id="chart_disk_space__System_Volumes_VM"]')
        cy.get('[data-netdata="disk_inodes./System/Volumes/VM"][id="chart_disk_inodes__System_Volumes_VM"]')

        // /Volumes/Recovery
        cy.get('h2#menu_disk_submenu__Volumes_Recovery').contains('/Volumes/Recovery');
        cy.get('[data-netdata="disk_space./Volumes/Recovery"][id="chart_disk_space__Volumes_Recovery"]')
        cy.get('[data-netdata="disk_inodes./Volumes/Recovery"][id="chart_disk_inodes__Volumes_Recovery"]')

        //  IPv4 Networking

        cy.get('h1#menu_ipv4').contains('IPv4 Networking');

        // tcp
        cy.get('h2#menu_ipv4_submenu_tcp').contains('tcp');
        cy.get('[data-netdata="ipv4.tcppackets"][id="chart_ipv4_tcppackets"]')
        cy.get('[data-netdata="ipv4.tcperrors"][id="chart_ipv4_tcperrors"]')
        cy.get('[data-netdata="ipv4.tcphandshake"][id="chart_ipv4_tcphandshake"]')

        // udp
        cy.get('h2#menu_ipv4_submenu_udp').contains('udp');
        cy.get('[data-netdata="ipv4.udppackets"][id="chart_ipv4_udppackets"]')
        cy.get('[data-netdata="ipv4.udperrors"][id="chart_ipv4_udperrors"]')

        // icmp
        cy.get('h2#menu_ipv4_submenu_icmp').contains('icmp');
        cy.get('[data-netdata="ipv4.icmp"][id="chart_ipv4_icmp"]')
        cy.get('[data-netdata="ipv4.icmp_errors"][id="chart_ipv4_icmp_errors"]')
        cy.get('[data-netdata="ipv4.icmpmsg"][id="chart_ipv4_icmpmsg"]')

        // packets
        cy.get('h2#menu_ipv4_submenu_packets').contains('packets');
        cy.get('[data-netdata="ipv4.packets"][id="chart_ipv4_packets"]')

        // errors
        cy.get('h2#menu_ipv4_submenu_errors').contains('errors');
        cy.get('[data-netdata="ipv4.errors"][id="chart_ipv4_errors"]')

        // fragments
        cy.get('h2#menu_ipv4_submenu_fragments').contains('fragments');
        cy.get('[data-netdata="ipv4.fragsout"][id="chart_ipv4_fragsout"]')
        cy.get('[data-netdata="ipv4.fragsin"][id="chart_ipv4_fragsin"]')

        //  IPv6 Networking

        cy.get('h1#menu_ipv6').contains('IPv6 Networking');

        cy.get('h2#menu_ipv6_submenu_packets').contains('packets');
        cy.get('[data-netdata="ipv6.packets"][id="chart_ipv6_packets"]')
        cy.get('h2#menu_ipv6_submenu_errors').contains('errors');
        cy.get('[data-netdata="ipv6.errors"][id="chart_ipv6_errors"]')
        cy.get('h2#menu_ipv6_submenu_icmp').contains('icmp');
        cy.get('[data-netdata="ipv6.icmp"][id="chart_ipv6_icmp"]')
        cy.get('[data-netdata="ipv6.icmperrors"][id="chart_ipv6_icmperrors"]')
        cy.get('[data-netdata="ipv6.icmprouter"][id="chart_ipv6_icmprouter"]')
        cy.get('[data-netdata="ipv6.icmpneighbor"][id="chart_ipv6_icmpneighbor"]')
        cy.get('[data-netdata="ipv6.icmptypes"][id="chart_ipv6_icmptypes"]')

        //   Network Interfaces

        cy.get('h1#menu_net').contains('Network Interfaces');

        // cups
        cy.get('h1#menu_cups').contains('cups');
        cy.get('h2#menu_cups_submenu_overview').contains('overview');
        cy.get('[data-netdata="cups.dest_state"][id="chart_cups_dest_state"]')
        cy.get('[data-netdata="cups.dest_option"][id="chart_cups_dest_option"]')
        cy.get('[data-netdata="cups.job_num"][id="chart_cups_job_num"]')
        cy.get('[data-netdata="cups.job_size"][id="chart_cups_job_size"]')

        // Netdata Monitoring
        cy.get('h1#menu_netdata').contains('Netdata Monitoring');
        cy.get('h2#menu_netdata_submenu_netdata').contains('netdata');
        cy.get('[data-netdata="netdata.net"][id="chart_netdata_net"]')
        cy.get('[data-netdata="netdata.server_cpu"][id="chart_netdata_server_cpu"]')
        cy.get('[data-netdata="netdata.uptime"][id="chart_netdata_uptime"]')
        cy.get('[data-netdata="netdata.clients"][id="chart_netdata_clients"]')
        cy.get('[data-netdata="netdata.response_time"][id="chart_netdata_response_time"]')
        cy.get('[data-netdata="netdata.compression_ratio"][id="chart_netdata_compression_ratio"]')
        cy.get('[data-netdata="netdata.clients"][id="chart_netdata_clients"]')
        cy.get('h2#menu_netdata_submenu_queries').contains('queries');
        cy.get('[data-netdata="netdata.queries"][id="chart_netdata_queries"]')
        cy.get('[data-netdata="netdata.db_points"][id="chart_netdata_db_points"]')
        cy.get('h2#menu_netdata_submenu_dbengine').contains('dbengine');
        cy.get('[data-netdata="netdata.dbengine_compression_ratio"][id="chart_netdata_dbengine_compression_ratio"]')
        cy.get('[data-netdata="netdata.page_cache_hit_ratio"][id="chart_netdata_page_cache_hit_ratio"]')
        cy.get('[data-netdata="netdata.page_cache_stats"][id="chart_netdata_page_cache_stats"]')
        cy.get('[data-netdata="netdata.dbengine_long_term_page_stats"][id="chart_netdata_dbengine_long_term_page_stats"]')
        cy.get('[data-netdata="netdata.dbengine_io_throughput"][id="chart_netdata_dbengine_io_throughput"]')
        cy.get('[data-netdata="netdata.dbengine_io_operations"][id="chart_netdata_dbengine_io_operations"]')
        cy.get('[data-netdata="netdata.dbengine_global_errors"][id="chart_netdata_dbengine_global_errors"]')
        cy.get('[data-netdata="netdata.dbengine_global_file_descriptors"][id="chart_netdata_dbengine_global_file_descriptors"]')
        cy.get('[data-netdata="netdata.dbengine_ram"][id="chart_netdata_dbengine_ram"]')
        cy.get('h2#menu_netdata_submenu_statsd').contains('statsd');
        cy.get('[data-netdata="netdata.plugin_statsd_charting_cpu"][id="chart_netdata_plugin_statsd_charting_cpu"]')
        cy.get('[data-netdata="netdata.plugin_statsd_collector1_cpu"][id="chart_netdata_plugin_statsd_collector1_cpu"]')
        cy.get('[data-netdata="netdata.statsd_metrics"][id="chart_netdata_statsd_metrics"]')
        cy.get('[data-netdata="netdata.statsd_useful_metrics"][id="chart_netdata_statsd_useful_metrics"]')
        cy.get('[data-netdata="netdata.statsd_events"][id="chart_netdata_statsd_events"]')
        cy.get('[data-netdata="netdata.statsd_reads"][id="chart_netdata_statsd_reads"]')
        cy.get('[data-netdata="netdata.statsd_bytes"][id="chart_netdata_statsd_bytes"]')
        cy.get('[data-netdata="netdata.statsd_packets"][id="chart_netdata_statsd_packets"]')
        cy.get('[data-netdata="netdata.tcp_connects"][id="chart_netdata_tcp_connects"]')
        cy.get('[data-netdata="netdata.tcp_connected"][id="chart_netdata_tcp_connected"]')
        cy.get('[data-netdata="netdata.private_charts"][id="chart_netdata_private_charts"]')

    })
  })

})
