import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

class SpeakerFormPage extends PageObject {
  readonly emailInput: Locator = this.page.getByLabel('Email');
  readonly nameInput: Locator = this.page.getByLabel('Full name');
  readonly pictureInput: Locator = this.page.getByLabel('Picture URL');
  readonly companyInput: Locator = this.page.getByLabel('Company');
  readonly locationInput: Locator = this.page.getByLabel('Location');
  readonly bioTextarea: Locator = this.page.getByLabel('Biography');
  readonly referencesTextarea: Locator = this.page.getByLabel('References');
  readonly socialLinkInputs: Locator = this.page.getByRole('textbox', { name: /Social link/ });
  readonly cancelButton: Locator = this.page.getByRole('link', { name: 'Cancel' });

  async fillSpeakerForm(speakerData: {
    email?: string;
    name?: string;
    picture?: string;
    company?: string;
    location?: string;
    bio?: string;
    references?: string;
    socialLinks?: string[];
  }) {
    if (speakerData.email !== undefined) {
      await this.fill(this.emailInput, speakerData.email);
    }

    if (speakerData.name !== undefined) {
      await this.fill(this.nameInput, speakerData.name);
    }

    if (speakerData.picture !== undefined) {
      await this.fill(this.pictureInput, speakerData.picture);
    }

    if (speakerData.company !== undefined) {
      await this.fill(this.companyInput, speakerData.company);
    }

    if (speakerData.location !== undefined) {
      await this.fill(this.locationInput, speakerData.location);
    }

    if (speakerData.bio !== undefined) {
      await this.fill(this.bioTextarea, speakerData.bio);
    }

    if (speakerData.references !== undefined) {
      await this.fill(this.referencesTextarea, speakerData.references);
    }

    if (speakerData.socialLinks) {
      for (let i = 0; i < speakerData.socialLinks.length && i < 4; i++) {
        await this.fill(this.socialLinkInputs.nth(i), speakerData.socialLinks[i]);
      }
    }
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

export class NewSpeakerPage extends SpeakerFormPage {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'New speaker' });
  readonly submitButton: Locator = this.page.getByRole('button', { name: 'Create speaker' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/speakers/new`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  async submitForm() {
    await this.submitButton.click();
  }
}

export class EditSpeakerPage extends SpeakerFormPage {
  readonly submitButton: Locator = this.page.getByRole('button', { name: 'Save speaker' });

  private getHeading(speakerName: string): Locator {
    return this.page.getByRole('heading', { name: `Edit speaker ${speakerName}` });
  }

  async goto(team: string, event: string, speaker: string, speakerName?: string) {
    await this.page.goto(`/team/${team}/${event}/speakers/${speaker}/edit`);
    await this.waitForHydration();
    if (speakerName) {
      await this.waitFor(speakerName);
    }
  }

  async waitFor(speakerName: string) {
    await this.getHeading(speakerName).waitFor();
  }

  async submitForm() {
    await this.submitButton.click();
  }
}
