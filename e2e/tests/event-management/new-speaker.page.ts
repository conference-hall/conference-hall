import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class NewSpeakerPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Create a new speaker' });
  readonly emailInput: Locator = this.page.getByLabel('Email');
  readonly nameInput: Locator = this.page.getByLabel('Full name');
  readonly pictureInput: Locator = this.page.getByLabel('Picture URL');
  readonly companyInput: Locator = this.page.getByLabel('Company');
  readonly locationInput: Locator = this.page.getByLabel('Location');
  readonly bioTextarea: Locator = this.page.getByLabel('Biography');
  readonly referencesTextarea: Locator = this.page.getByLabel('References');
  readonly socialLinkInputs: Locator = this.page.getByRole('textbox', { name: /Social link/ });
  readonly submitButton: Locator = this.page.getByRole('button', { name: 'Create speaker' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/speakers/new`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async fillSpeakerForm(speakerData: {
    email: string;
    name: string;
    picture?: string;
    company?: string;
    location?: string;
    bio?: string;
    references?: string;
    socialLinks?: string[];
  }) {
    await this.fill(this.emailInput, speakerData.email);
    await this.fill(this.nameInput, speakerData.name);

    if (speakerData.picture) {
      await this.fill(this.pictureInput, speakerData.picture);
    }

    if (speakerData.company) {
      await this.fill(this.companyInput, speakerData.company);
    }

    if (speakerData.location) {
      await this.fill(this.locationInput, speakerData.location);
    }

    if (speakerData.bio) {
      await this.fill(this.bioTextarea, speakerData.bio);
    }

    if (speakerData.references) {
      await this.fill(this.referencesTextarea, speakerData.references);
    }

    if (speakerData.socialLinks) {
      for (let i = 0; i < speakerData.socialLinks.length && i < 4; i++) {
        await this.fill(this.socialLinkInputs.nth(i), speakerData.socialLinks[i]);
      }
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }
}
