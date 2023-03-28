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
    cy.findByRole('menuitem', { name: 'Activity' }).click();
  }

  openTalks() {
    cy.findByRole('menuitem', { name: 'Your talks' }).click();
  }

  openProfile() {
    cy.findByRole('menuitem', { name: 'Your profile' }).click();
  }

  openOrganizations() {
    cy.findByRole('menuitem', { name: 'Your organizations' }).click();
  }

  signOut() {
    cy.clickOn('Sign out');
  }
}

class NotificationsMenu {
  open() {
    cy.clickOn('View notifications');
    return this;
  }

  openAcceptedProposal(eventName: string, proposalName: string) {
    cy.findByRole('menuitem', {
      name: `🎉 ${proposalName} has been accepted to ${eventName}. Please confirm or decline your participation.`,
    }).click();
  }
}

export default BasePage;
