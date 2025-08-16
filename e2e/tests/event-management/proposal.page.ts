import { TalkFormComponent } from 'e2e/common/talk-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';

export class ProposalPage extends PageObject {
  readonly referencesToggle = this.page.getByRole('button', { name: 'References' });
  readonly otherProposalsToggle = this.page.getByRole('button', { name: 'Other proposals by speakers' });

  readonly activityFeed = this.page.getByRole('list', { name: 'Activity feed' }).locator('>li');
  readonly commentInput = this.page.getByRole('textbox', { name: 'Add your comment' });
  readonly commentButton = this.page.getByRole('button', { name: 'Comment' });

  readonly nextProposal = this.page.getByLabel('Next proposal');
  readonly previousProposal = this.page.getByLabel('Previous proposal');

  readonly deliberationStatus = this.page.getByLabel('Change proposal status');
  readonly publicationStatus = this.page.getByRole('heading', { name: 'Publication' });
  readonly publishButton = this.page.getByRole('button', { name: 'Publish result to speakers' });
  readonly waitingConfirmation = this.page.getByText('Waiting for speaker confirmation');
  readonly resultPublished = this.page.getByText('Result published to speakers');

  readonly tagsButton = this.page.getByRole('button', { name: 'Tags', exact: true });
  readonly speakersButton = this.page.getByRole('button', { name: 'Speakers', exact: true });
  readonly formatsButton = this.page.getByRole('button', { name: 'Formats', exact: true });
  readonly categoriesButton = this.page.getByRole('button', { name: 'Categories', exact: true });

  async goto(team: string, event: string, id: string, title: string) {
    await this.page.goto(`/team/${team}/${event}/reviews/${id}`);
    await this.waitFor(title);
  }

  async waitFor(name: string) {
    await this.page.getByRole('heading', { name }).waitFor();
  }

  async clickOnEdit() {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    return new TalkFormComponent(this.page, true);
  }

  speaker(name: string) {
    return this.page.getByLabel(`View ${name} profile`);
  }

  async clickOnSpeaker(name: string) {
    await this.speaker(name).click();
    return this.page.getByRole('dialog', { name });
  }
}
