import type { Locator } from '@playwright/test';
import { MessageBlockComponent } from '../../common/message-block.component.ts';
import { SpeakerPanelComponent } from '../../common/speaker-panel.component.ts';
import { TalkFormComponent } from '../../common/talk-form.component.ts';
import { PageObject } from '../../page-object.ts';

export class ProposalPage extends PageObject {
  readonly referencesToggle = this.page.getByRole('button', { name: 'References' });
  readonly otherProposalsToggle = this.page.getByRole('button', { name: 'Other proposals by speakers' });

  readonly activityFeed = this.page.getByRole('list', { name: 'Activity feed' }).locator('>li');
  readonly commentInput = this.page.getByRole('textbox', { name: 'Add your comment' });
  readonly commentButton = this.page.getByRole('button', { name: 'Comment' });

  readonly nextProposal = this.page.getByRole('link', { name: 'Next proposal' });
  readonly previousProposal = this.page.getByRole('link', { name: 'Previous proposal' });

  readonly deliberationStatus = this.page.getByLabel('Change proposal status');
  readonly publicationStatus = this.page.getByRole('heading', { name: 'Publication' });
  readonly publishButton = this.page.getByRole('button', { name: 'Publish result to speakers' });
  readonly waitingConfirmation = this.page.getByText('Waiting for speaker confirmation');
  readonly resultPublished = this.page.getByText('Result published to speakers');

  readonly speakerPanel = new SpeakerPanelComponent(this.page);
  readonly tagsButton = this.page.getByRole('button', { name: 'Tags', exact: true });
  readonly speakersButton = this.page.getByRole('button', { name: 'Speakers', exact: true });
  readonly formatsButton = this.page.getByRole('button', { name: 'Formats', exact: true });
  readonly categoriesButton = this.page.getByRole('button', { name: 'Categories', exact: true });

  readonly conversationDrawerButton = this.page.getByRole('button').filter({ hasText: /message|Conversation/ });
  readonly actionsMenuButton = this.page.getByRole('button', { name: 'Proposal action menu' });

  async goto(team: string, event: string, routeId: string, title: string) {
    await this.page.goto(`/team/${team}/${event}/proposals/${routeId}`);
    await this.waitFor(title);
  }

  async waitFor(name: string) {
    await this.waitForHydration();
    await this.page.getByRole('heading', { name }).waitFor();
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

  async openConversationDrawer() {
    await this.conversationDrawerButton.click();
    const drawer = this.page.getByRole('dialog');
    await drawer.getByRole('button', { name: 'Send' }).waitFor();
    return drawer;
  }

  async getConversationMessages(drawer: Locator) {
    const messages = await drawer.locator('ul > li').all();
    return messages.map((message) => new MessageBlockComponent(message, this.page));
  }

  async sendMessageInDrawer(drawer: Locator, content: string) {
    const input = drawer.getByRole('textbox');
    await input.fill(content);
    await drawer.getByRole('button', { name: 'Send' }).click();
  }
}
