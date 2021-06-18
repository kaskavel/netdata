/// <reference types="cypress" />

context('Assertions', () => {
  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl)
  })

  describe('Implicit Assertions', () => {
    it('.should() - Assert functionality of basic elements', () => {

      	// date picker
		cy.get('div.styled__AccessorBox-sc-1yj3701-8').click();
      	cy.get('[data-testid="date-picker::click-quick-selector::::7200"]').click();
      	cy.get('[data-testid="date-picker::click-apply::-start"]').click();
      	cy.get('div.styled__AccessorBox-sc-1yj3701-8').contains('Last 2 hours');
	
		// Theme changer
		cy.get('[data-target="#optionsModal"][title="Settings"]').click();
		cy.get('[data-toggle="tab"][role="tab"]').contains('Visual').click();
      	cy.contains('Dark').click({force: true});
		cy.get('div#loadOverlay').should('have.css', 'color', 'rgb(221, 221, 221)')
    })
  })

})

