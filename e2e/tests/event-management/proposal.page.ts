import { CoSpeakerComponent } from 'e2e/common/co-speaker.component.ts';
import { TalkEditFormComponent } from 'e2e/common/talk-edit-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';

export class ProposalPage extends PageObject {
  readonly referencesToggle = this.page.getByRole('button', { name: 'References' });
  readonly otherProposalsToggle = this.page.getByRole('button', { name: 'Other proposals by speakers' });

  readonly activityFeed = this.page.getByRole('list', { name: 'Activity feed' }).locator('>li');
  readonly commentInput = this.page.getByRole('textbox', { name: 'Add your comment' });
  readonly commentButton = this.page.getByRole('button', { name: 'Comment' });

  readonly nextProposal = this.page.getByLabel('Next proposal');
  readonly previousProposal = this.page.getByLabel('Previous proposal');

  readonly deliberationStatus = this.page.getByLabel('Change deliberation status');
  readonly publicationStatus = this.page.getByRole('heading', { name: 'Publication' });
  readonly publishButton = this.page.getByRole('button', { name: 'Publish result to speakers' });
  readonly waitingConfirmation = this.page.getByText('Waiting for confirmation');
  readonly resultPublished = this.page.getByText('Result published to speakers');

  readonly tagsButton = this.page.getByRole('button', { name: 'Tags' });

  async goto(team: string, event: string, id: string, title: string) {
    await this.page.goto(`/team/${team}/${event}/reviews/${id}`);
    await this.waitFor(title);
  }

  async waitFor(name: string) {
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('heading', { name }).waitFor();
  }

  async clickOnEdit() {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    return new TalkEditFormComponent(this.page, true);
  }

  speaker(name: string) {
    return this.page.getByLabel(`View ${name} profile`);
  }

  async clickOnSpeaker(name: string) {
    await this.speaker(name).click();
    return new CoSpeakerComponent(this.page);
  }
}
