import BasePage from './base.page';

class LoginPage extends BasePage {
  visit(redirectTo?: string) {
    if (redirectTo) {
      cy.visit(`/login?redirectTo=${redirectTo}`);
    } else {
      cy.visitAndCheck('/login');
    }
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Sign in to your account' }).should('exist');
  }

  signinWithGoogle(username: string) {
    cy.location('pathname').should('contain', '/login').wait(1000);
    cy.findByRole('heading', { name: 'Sign in to your account' }).should('exist');
    cy.findByRole('button', { name: 'Google' }).click();
    cy.assertText('Please select an existing account in the Auth Emulator or add a new one:');
    cy.findByText(username).click();
  }
}

export default LoginPage;
