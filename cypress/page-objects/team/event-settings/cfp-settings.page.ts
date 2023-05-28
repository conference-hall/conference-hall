import BasePage from 'page-objects/base.page';

type CfpFormType = {
  cfpStart?: string;
  cfpEnd?: string;
  maxProposals?: string;
  codeOfConductUrl?: string;
};

class CfpSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/team/${slug}/${eventSlug}/settings/cfp`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Call for paper opening' }).should('exist');
  }

  saveConferenceOpenings(data: CfpFormType) {
    if (data.cfpStart) cy.typeOn('Opening date', data.cfpStart);
    if (data.cfpEnd) cy.typeOn('Closing date', data.cfpEnd);
    cy.findByRole('button', { name: 'Save CFP openings' }).click();
  }

  saveCfpPreferences(data: CfpFormType) {
    if (data.maxProposals) cy.typeOn('Maximum of proposals per speaker', data.maxProposals);
    if (data.codeOfConductUrl) cy.typeOn('Code of conduct URL', data.codeOfConductUrl);
    cy.findByRole('button', { name: 'Update CFP preferences' }).click();
  }

  toggleCfpMeetup(checked: boolean) {
    return cy.findByRole('switch', { name: 'Call for paper open', checked });
  }
}

export default CfpSettings;
