import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { getUserNotifications, NOTIFICATION_TYPE } from './notification.server';

describe('#getUserNotifications', () => {
  beforeEach(async () => {
    await resetDB();
  });

  afterEach(disconnectDB);

  it('returns accepted proposals as notifications', async () => {
    const speaker1 = await userFactory();
    const speaker2 = await userFactory();
    const event = await eventFactory();
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker2] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker2] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['draft'] });

    const proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['accepted'],
      attributes: { emailAcceptedStatus: 'SENT' },
    });

    const notifications = await getUserNotifications(speaker1.id);

    expect(notifications).toEqual([
      {
        type: NOTIFICATION_TYPE.ACCEPTED_PROPOSAL,
        proposal: {
          id: proposal.id,
          title: proposal.title,
        },
        event: {
          slug: proposal.event.slug,
          name: proposal.event.name,
        },
        date: proposal.updatedAt.toUTCString(),
      },
    ]);
  });
});
