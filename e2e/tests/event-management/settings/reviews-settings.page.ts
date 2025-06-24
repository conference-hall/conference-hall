import { PageObject } from 'e2e/page-object.ts';

export class ReviewsSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Reviews' });
  readonly enableReviewSwitch = this.page.getByRole('switch', { name: 'Proposals review activation' });
  readonly displayReviewsSwitch = this.page.getByRole('switch', { name: 'Display reviews of all team members' });
  readonly displaySpeakersSwitch = this.page.getByRole('switch', { name: 'Display speaker information' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/review`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
