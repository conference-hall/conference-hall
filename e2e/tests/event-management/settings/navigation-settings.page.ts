import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { CfpSettingsPage } from './cfp-settings.page.ts';
import { CustomizeSettingsPage } from './customize-settings.page.ts';
import { GeneralSettingsPage } from './general-settings.page.ts';
import { IntegrationsSettingsPage } from './integrations-settings.page.ts';
import { NotificationsSettingsPage } from './notifications-settings.page.ts';
import { ReviewsSettingsPage } from './reviews-settings.page.ts';
import { SurveySettingsPage } from './survey-settings.page.ts';
import { TagsSettingsPage } from './tags-settings.page.ts';
import { TracksSettingsPage } from './tracks-settings.page.ts';
import { WebApiSettingsPage } from './web-api-settings.page.ts';

type NavigationSettings =
  | 'General'
  | 'Call for papers'
  | 'Tracks'
  | 'Proposal tags'
  | 'Customize'
  | 'Speaker survey'
  | 'Reviews'
  | 'Email notifications'
  | 'Integrations'
  | 'Web API';

export class NavigationSettingsPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Event settings' });
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnSetting(name: NavigationSettings) {
    await this.page.getByRole('link', { name }).click();
    switch (name) {
      case 'General':
        return new GeneralSettingsPage(this.page);
      case 'Call for papers':
        return new CfpSettingsPage(this.page);
      case 'Tracks':
        return new TracksSettingsPage(this.page);
      case 'Proposal tags':
        return new TagsSettingsPage(this.page);
      case 'Customize':
        return new CustomizeSettingsPage(this.page);
      case 'Speaker survey':
        return new SurveySettingsPage(this.page);
      case 'Reviews':
        return new ReviewsSettingsPage(this.page);
      case 'Email notifications':
        return new NotificationsSettingsPage(this.page);
      case 'Integrations':
        return new IntegrationsSettingsPage(this.page);
      case 'Web API':
        return new WebApiSettingsPage(this.page);
      default:
        throw new Error(`Unknown setting: ${name}`);
    }
  }
}
