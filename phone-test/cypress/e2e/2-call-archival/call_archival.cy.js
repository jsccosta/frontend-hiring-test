/// <reference types="cypress" />


describe('Test Call Archival', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
    cy.get('#email').type('joe@aircall.io');
    cy.get('#password').type('pass');
    cy.findByRole('button', {
      name: /login/i
    }).click();
    
  })
  it('clicking on unarchived call should archive call', () => {
    cy.get('[data-testid="call-archival-button"]').should('have.length', 5);
    cy.get('[data-testid="unarchived-call-card"]').first().find('[data-testid="call-archival-button"]').click();
    cy.get('[data-test="toast-success"]').should('be.visible');
    cy.get('[data-test="toast-success"]').contains('Call archived')
  })

  it('clicking on archived call should unarchive call', () => {
    cy.get('[data-testid="call-archival-button"]').should('have.length', 5);
    cy.get('[data-testid="archived-call-card"]').first().find('[data-testid="call-archival-button"]').click();
    cy.get('[data-test="toast-success"]').should('be.visible');
    cy.get('[data-test="toast-success"]').contains('Call unarchived')
  })
})
