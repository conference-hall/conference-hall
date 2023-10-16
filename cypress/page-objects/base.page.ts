class BasePage {
  home() {
    cy.findByRole('link', { name: 'Home' }).click();
  }

  talksLibrary() {
    cy.findByRole('link', { name: 'Talks library' }).click();
  }

  profile() {
    cy.findByRole('link', { name: 'Profile' }).click();
  }

  userMenu() {
    return new UserMenu();
  }
}

class UserMenu {
  menu() {
    return cy.findByRole('button', { name: /open user menu/i });
  }

  open() {
    this.menu().click();
    cy.findByRole('navigation', { name: 'User navigation' }).should('be.visible');
    return this;
  }

  isOpen() {
    cy.findByRole('navigation', { name: 'User navigation' }).should('be.visible');
  }

  signOut() {
    cy.findByRole('link', { name: 'Sign out' }).click();
  }
}

export default BasePage;
