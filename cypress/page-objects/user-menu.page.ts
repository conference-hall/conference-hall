class UserMenuPage {
  open() {
    cy.clickOn('Open user menu');
  }

  menu() {
    return cy.findByRole('menu', { name: 'Open user menu' });
  }

  isMenuOpen(email: string) {
    this.menu().within(() => {
      cy.assertText('Signed in as');
      cy.assertText(email);
    });
  }
}

export default UserMenuPage;
