import type { Locator } from '@playwright/test';
import { MessageBlockComponent } from '../../common/message-block.component.ts';
import { SpeakerPanelComponent } from '../../common/speaker-panel.component.ts';
import { TalkFormComponent } from '../../common/talk-form.component.ts';
import { PageObject } from '../../page-object.ts';

export class ProposalPage extends PageObject {
  readonly referencesToggle = this.page.getByRole('button', { name: 'References' });
  readonly otherProposalsToggle = this.page.getByRole('button', { name: 'Other proposals by speakers' });

  readonly commentsTab = this.page.getByRole('tab', { name: /^Comments/ });
  readonly reviewsTab = this.page.getByRole('tab', { name: /^Reviews/ });
  readonly speakersTab = this.page.getByRole('tab', { name: /^Speakers/ });
  readonly tablist = this.page.getByRole('tablist');
  readonly yourReviewHeading = this.page.getByRole('heading', { name: 'Your review' });
  readonly discussionPanel = this.page.getByRole('tabpanel');
  readonly comments = this.page.getByRole('list', { name: 'Comments' }).locator('> li');
  readonly reviews = this.page.getByRole('list', { name: 'Reviews' }).getByRole('listitem');
  readonly speakerMessages = this.page.getByRole('list', { name: 'Messages with speakers' }).locator('> li');
  readonly newMessagesPill = this.page.getByRole('button', { name: /new messages?$/ });
  readonly reviewsLink = this.page.getByRole('button', { name: /^\d+ reviews?$/ });
  readonly commentInput = this.page.getByRole('textbox', { name: 'Add your comment' });
  readonly commentButton = this.page.getByRole('button', { name: 'Comment' });
  readonly speakerMessageInput = this.discussionPanel.getByRole('textbox', { name: /^Send a message to/ });
  readonly sendToSpeakersButton = this.discussionPanel.getByRole('button', { name: 'Send to speakers' });

  readonly nextProposal = this.page.getByRole('link', { name: 'Next proposal' });
  readonly previousProposal = this.page.getByRole('link', { name: 'Previous proposal' });

  readonly deliberationStatus = this.page.getByLabel('Change proposal status');
  readonly publicationStatus = this.page.getByRole('heading', { name: 'Publication' });
  readonly publishButton = this.page.getByRole('button', { name: 'Publish result to speakers' });
  readonly waitingConfirmation = this.page.getByText('Waiting for confirmation');
  readonly resultPublished = this.page.getByText('Result published to speakers');

  readonly speakerPanel = new SpeakerPanelComponent(this.page);
  readonly tagsButton = this.page.getByRole('button', { name: 'Tags', exact: true });
  readonly speakersButton = this.page.getByRole('button', { name: 'Speakers', exact: true });
  readonly formatsButton = this.page.getByRole('button', { name: 'Formats', exact: true });
  readonly categoriesButton = this.page.getByRole('button', { name: 'Categories', exact: true });

  readonly actionsMenuButton = this.page.getByRole('button', { name: 'Proposal action menu' });

  async goto(team: string, event: string, routeId: string, title: string) {
    await this.page.goto(`/team/${team}/${event}/proposals/${routeId}`);
    await this.waitFor(title);
  }

  async waitFor(name: string) {
    await this.waitForHydration();
    await this.page.getByRole('heading', { name }).waitFor();
  }

  proposalTitle(name: string) {
    return this.page.getByRole('heading', { name });
  }

  globalReview(note: number) {
    return this.page.getByLabel(`Global review = ${note}`);
  }

  dismissReviewButton(reviewerName: string) {
    return this.reviews.filter({ hasText: reviewerName }).getByRole('button', { name: 'Dismiss review' });
  }

  speakerMessage(content: string) {
    return this.speakerMessages.filter({ hasText: content });
  }

  async top(locator: Locator) {
    const box = await locator.boundingBox();
    return box?.y ?? Number.NaN;
  }

  async hasHorizontalScroll() {
    return this.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  }

  async pressReviewShortcut(key: string) {
    await this.page.keyboard.press(key);
  }

  async clickOnEdit() {
    await this.actionsMenuButton.click();
    await this.page.getByRole('menu', { name: 'Proposal action menu' }).waitFor();
    await this.page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
    return new TalkFormComponent(this.page, true);
  }

  async archiveProposal() {
    await this.actionsMenuButton.click();
    await this.page.getByRole('menu', { name: 'Proposal action menu' }).waitFor();
    await this.page.getByRole('button', { name: 'Archive' }).click();
  }

  async restoreProposal() {
    await this.actionsMenuButton.click();
    await this.page.getByRole('menu', { name: 'Proposal action menu' }).waitFor();
    await this.page.getByRole('button', { name: 'Restore' }).click();
  }

  speaker(name: string) {
    return this.page.getByLabel(`View ${name} profile`);
  }

  async clickOnSpeaker(name: string) {
    await this.speaker(name).click();
    return this.page.getByRole('dialog', { name });
  }

  async sendSpeakerMessage(content: string) {
    await this.speakerMessageInput.fill(content);
    await this.sendToSpeakersButton.click();
  }

  async getSpeakerMessages() {
    const messages = await this.speakerMessages.all();
    return messages.map((message) => new MessageBlockComponent(message, this.page));
  }
}
