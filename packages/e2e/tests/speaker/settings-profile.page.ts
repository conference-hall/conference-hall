import type { Locator } from '@playwright/test';
import { href } from 'react-router';
import { PageObject } from '../../helpers/page-object.ts';

export class SettingsProfilePage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Profile', exact: true });
  readonly bioInput: Locator = this.page.getByLabel('Biography');
  readonly referencesInput: Locator = this.page.getByLabel('References');
  readonly companyInput: Locator = this.page.getByLabel('Company');
  readonly locationInput: Locator = this.page.getByLabel('Location (city, country)');
  readonly socialLinkInput: Locator = this.page.getByLabel('Social link 1');

  async goto() {
    await this.page.goto(href('/speaker/settings/profile'));
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async fillProfile(bio: string, references: string, company: string, location: string, socialLink: string) {
    await this.bioInput.fill(bio);
    await this.referencesInput.fill(references);
    await this.companyInput.fill(company);
    await this.locationInput.fill(location);
    await this.socialLinkInput.fill(socialLink);
    await this.page.getByRole('button', { name: 'Save profile' }).click();
  }
}
