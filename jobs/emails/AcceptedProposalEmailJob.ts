import { JobProcessor } from '../processor';

type Payload = { from: string; to: string[]; bcc?: string[]; variables: { name: string } };

export class AcceptedProposalEmailJob extends JobProcessor<Payload> {
  queueName = 'default';
  jobName = 'accepted-proposal-email-job';

  async process(payload: Payload) {
    console.log('XXX', this.jobName, payload);
  }
}
