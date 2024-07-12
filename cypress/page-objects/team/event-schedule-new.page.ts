import BasePage from '../base.page.ts';
import SchedulePage from './event-schedule.page.ts';

class ScheduleNewPage extends BasePage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}/schedule`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'New schedule' }).should('exist');
  }

  create() {
    cy.findByRole('button', { name: 'New schedule' }).click();
    return new SchedulePage();
  }
}

export default ScheduleNewPage;
