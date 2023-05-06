class BasePage {
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

  searchEvents() {
    cy.findByRole('menuitem', { name: 'Search events' }).click();
  }

  openActivity() {
    cy.findByRole('menuitem', { name: 'Home' }).click();
  }

  openTalks() {
    cy.findByRole('menuitem', { name: 'Talks' }).click();
  }

  openProfile() {
    cy.findByRole('menuitem', { name: 'Profile' }).click();
  }

  openOrganizations() {
    cy.findByRole('menuitem', { name: 'Organizations' }).click();
  }

  signOut() {
    cy.findByRole('button', { name: 'Sign out' }).click();
  }
}

export default BasePage;
