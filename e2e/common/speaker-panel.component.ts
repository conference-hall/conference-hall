import { PageObject } from 'e2e/page-object.ts';

class SpeakerModalComponent extends PageObject {
  readonly modal = this.page.locator('[role="dialog"]');
  readonly emailInput = this.modal.getByLabel('Email');
  readonly nameInput = this.modal.getByLabel('Full Name');
  readonly companyInput = this.modal.getByLabel('Company');
  readonly bioInput = this.modal.getByLabel('Biography');
  readonly createButton = this.modal.getByRole('button', { name: 'Create speaker' });

  async waitFor() {
    await this.emailInput.waitFor();
  }

  async fillSpeakerForm(email: string, name: string, company: string, bio: string) {
    await this.emailInput.fill(email);
    await this.nameInput.fill(name);
    await this.companyInput.fill(company);
    await this.bioInput.fill(bio);
  }

  async createSpeaker() {
    await this.createButton.click();
  }
}

export class SpeakerPanelComponent extends PageObject {
  readonly panelButton = this.page.getByRole('button', { name: 'Speakers' });
  readonly searchInput = this.page.getByRole('combobox', { name: 'Search...' });
  readonly createSpeakerButton = this.page.getByRole('button', { name: 'Create speaker' });

  async togglePanel() {
    await this.panelButton.click();
  }

  async searchSpeaker(query: string) {
    await this.searchInput.fill(query);
  }

  async selectSpeakerByName(name: string) {
    const speakerOption = this.page.getByRole('option', { name });
    await speakerOption.click();
  }

  async clickCreateSpeaker() {
    await this.createSpeakerButton.click();
    const modal = new SpeakerModalComponent(this.page);
    await modal.waitFor();
    return modal;
  }

  speakerCheckbox(name: string) {
    return this.page.getByRole('checkbox').filter({ hasText: name });
  }
}
