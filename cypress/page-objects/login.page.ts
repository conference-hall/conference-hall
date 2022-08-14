class LoginPage {
  visit(redirectTo?: string) {
    if (redirectTo) {
      return cy.visit(`/login?redirectTo=${redirectTo}`);
    }
    return cy.visit('/login');
  }

  signinWithGoogle(username: string) {
    cy.clickOn('Continue with Google');
    cy.url().should('contain', '/emulator');
    cy.findByText(username).click();
  }
}

export default LoginPage;
