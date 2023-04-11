class BasePage {
  userMenu() {
    return new UserMenu();
  }

  notificationsMenu() {
    return new NotificationsMenu();
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

class NotificationsMenu {
  open() {
    cy.findByRole('link', { name: 'View notifications' }).click();
    return this;
  }

  openAcceptedProposal(eventName: string, proposalName: string) {
    cy.findByRole('menuitem', {
      name: `🎉 ${proposalName} has been accepted to ${eventName}. Please confirm or decline your participation.`,
    }).click();
  }
}

export default BasePage;
