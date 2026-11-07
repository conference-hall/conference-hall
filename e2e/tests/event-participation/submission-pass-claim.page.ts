import { PageObject } from '../../page-object.ts';

export class SubmissionPassClaimPage extends PageObject {
  readonly invitation = this.page.getByText('The organizers invite you to submit a proposal');
  readonly switchAccountButton = this.page.getByRole('button', { name: 'Not you?' });
  readonly claimButton = this.page.getByRole('button', { name: 'Accept the pass' });
  readonly claimedErrorHeading = this.page.getByRole('heading', {
    name: 'This pass belongs to another speaker',
  });
  readonly claimedErrorDescription = this.page.getByText('Ask the organizers for your own link.');
  readonly notFoundErrorHeading = this.page.getByRole('heading', { name: 'This link no longer works' });

  async goto(code: string) {
    await this.page.goto(`/invite/pass/${code}`);
  }

  async waitFor(eventName: string) {
    await this.waitForHydration();
    await this.eventHeading(eventName).waitFor();
  }

  eventHeading(eventName: string) {
    return this.page.getByRole('heading', { name: eventName });
  }

  accountEmail(email: string) {
    return this.page.getByText(email);
  }
}
