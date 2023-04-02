class TracksSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/tracks`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Formats' }).should('exist');
  }

  formatsBlock() {
    return cy.findByRole('heading', { name: 'Formats' }).parent();
  }

  formatsRequired() {
    cy.findByRole('checkbox', { name: 'Format selection required' }).click();
  }

  newFormat() {
    return cy.findByRole('button', { name: 'New format' });
  }

  newFormatModal() {
    return cy.findByRole('dialog', { name: 'Format track' });
  }

  categoriesBlock() {
    return cy.findByRole('heading', { name: 'Categories' }).parent();
  }

  categoriesRequired() {
    cy.findByRole('checkbox', { name: 'Category selection required' }).click();
  }

  newCategory() {
    return cy.findByRole('button', { name: 'New category' });
  }

  newCategoryModal() {
    return cy.findByRole('dialog', { name: 'Category track' });
  }
}

export default TracksSettings;
