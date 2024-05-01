/// <reference types="cypress" />


describe('Test Authentication', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
    cy.get('#email').type('joe@aircall.io');
    cy.get('#password').type('pass');
    cy.findByRole('button', {
      name: /login/i
    }).click();
    
  })

  it('successfully logs in and displays default count of 5 cards', () => {
    cy.contains('logout').should('be.visible');
    cy.contains(/calls history/i).should('be.visible');
    cy.get('[data-testid="call-card"]').should('have.length', 5);
  })

  it('successfully goes into detail view when clicking card in list', () => {
    cy.contains('logout').should('be.visible');
    cy.contains(/calls history/i).should('be.visible');
    cy.get('[data-testid="call-card"]').eq(1).click();
    cy.get('[data-testid="call-detail-card"]').should('be.visible');
  })

  it('successfully logs out', () => {
    cy.contains('logout').should('be.visible');
    cy.contains(/calls history/i).should('be.visible');
    cy.contains('logout').click();
    cy.get('[data-testid="login-page"]').should('be.visible');
  })

})
