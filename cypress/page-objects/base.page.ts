class BasePage {
  openUserMenu() {
    return new UserMenu().open();
  }

  openNotifications() {
    return new NotificationsMenu().open();
  }
}

class UserMenu {
  open() {
    cy.clickOn('Open user menu');
    cy.assertText('Signed in as');
    return this;
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
