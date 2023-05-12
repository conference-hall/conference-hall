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

  teams() {
    cy.findByRole('link', { name: 'Teams' }).click();
  }

  userMenu() {
    return new UserMenu();
  }
}

class UserMenu {
  menu() {
    return cy.findByRole('button', { name: /^Open user menu/i });
  }

  open() {
    this.menu().click();
    cy.assertText('Signed in as');
    return this;
  }

  isOpen(email: string) {
    cy.assertText('Signed in as');
  }

  signOut() {
    cy.findByRole('button', { name: 'Sign out' }).click();
  }
}

export default BasePage;
