import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class ProfilePage extends PageObject {
  readonly heading: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly avatarInput: Locator;
  readonly bioInput: Locator;
  readonly referencesInput: Locator;
  readonly companyInput: Locator;
  readonly locationInput: Locator;
  readonly twitterInput: Locator;
  readonly githubInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'My profile' });
    this.fullNameInput = page.getByLabel('Full name');
    this.emailInput = page.getByLabel('Email address');
    this.avatarInput = page.getByLabel('Avatar picture URL');
    this.bioInput = page.getByLabel('Biography');
    this.referencesInput = page.getByLabel('Speaker references');
    this.companyInput = page.getByLabel('Company');
    this.locationInput = page.getByLabel('Location (city, country)');
    this.twitterInput = page.getByLabel('Twitter');
    this.githubInput = page.getByLabel('GitHub');
  }

  async goto() {
    await this.page.goto('/speaker/profile');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async fillPersonalInfoForm(name: string, email: string, avatarUrl: string) {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.avatarInput.fill(avatarUrl);
    await this.page.getByLabel('Personal information').getByRole('button', { name: 'Save' }).click();
  }

  async fillSpeakerDetails(bio: string, references: string) {
    await this.bioInput.fill(bio);
    await this.referencesInput.fill(references);
    await this.page.getByLabel('Speaker details').getByRole('button', { name: 'Save' }).click();
  }

  async fillAdditionalInfo(company: string, location: string, twitter: string, github: string) {
    await this.companyInput.fill(company);
    await this.locationInput.fill(location);
    await this.twitterInput.fill(twitter);
    await this.githubInput.fill(github);
    await this.page.getByLabel('Additional information').getByRole('button', { name: 'Save' }).click();
  }

  async fullNameError() {
    return this.getInputDescription(this.fullNameInput);
  }

  async emailError() {
    return this.getInputDescription(this.emailInput);
  }
}
