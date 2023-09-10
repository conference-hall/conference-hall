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
    cy.findByRole('button', { name: 'Google' }).click();
    cy.url().should('contain', '/emulator');
    cy.findByText(username).click();
  }
}

export default LoginPage;
