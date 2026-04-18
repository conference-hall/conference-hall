import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Proposal, User } from '../../../../../prisma/generated/client.ts';
import { processNotification } from './process-notification.job.ts';

vi.mock('~/shared/emails/send-email.job.ts', () => ({
  sendEmail: { trigger: vi.fn() },
}));

describe('processNotification', () => {
  let speaker: User;
  let event: Event;
  let proposal: Proposal;

  beforeEach(async () => {
    vi.clearAllMocks();
    speaker = await userFactory();
    event = await eventFactory();
    proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker] }),
    });
  });

  it('creates in-app notification for proposal.submitted', async () => {
    await processNotification.config.run({ type: 'proposal.submitted', eventId: event.id, proposalId: proposal.id });

    const notifications = await db.notification.findMany({ where: { userId: speaker.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('PROPOSAL_SUBMITTED');
    expect(notifications[0].data).toEqual(
      expect.objectContaining({
        eventSlug: event.slug,
        eventName: event.name,
        proposalId: proposal.id,
        proposalTitle: proposal.title,
      }),
    );
  });

  it('creates in-app notification for proposal.accepted', async () => {
    await processNotification.config.run({ type: 'proposal.accepted', eventId: event.id, proposalId: proposal.id });

    const notifications = await db.notification.findMany({ where: { userId: speaker.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('PROPOSAL_ACCEPTED');
  });

  it('creates in-app notification for proposal.rejected', async () => {
    await processNotification.config.run({ type: 'proposal.rejected', eventId: event.id, proposalId: proposal.id });

    const notifications = await db.notification.findMany({ where: { userId: speaker.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('PROPOSAL_REJECTED');
  });

  it('triggers email for each speaker individually', async () => {
    const { sendEmail } = await import('~/shared/emails/send-email.job.ts');

    const speaker2 = await userFactory({ attributes: { locale: 'fr' } });
    const talk = await talkFactory({ speakers: [speaker, speaker2] });
    const proposal2 = await proposalFactory({ event, talk });

    await processNotification.config.run({ type: 'proposal.submitted', eventId: event.id, proposalId: proposal2.id });

    expect(sendEmail.trigger).toHaveBeenCalledTimes(2);
  });

  it('does nothing when proposal not found', async () => {
    await processNotification.config.run({ type: 'proposal.submitted', eventId: event.id, proposalId: 'non-existent' });

    const notifications = await db.notification.findMany({ where: { userId: speaker.id } });
    expect(notifications).toHaveLength(0);
  });
});
