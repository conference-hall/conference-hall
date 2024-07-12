import BasePage from '../base.page.ts';

class SchedulePage extends BasePage {
  isPageVisible(scheduleName: string) {
    cy.findByRole('heading', { name: scheduleName }).should('exist');
  }
}

export default SchedulePage;
