import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { getEventProposals } from './get-event-proposals.server';

describe('#getEventProposals', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('return proposals from api', async () => {
    const speaker = await userFactory();
    const event = await eventFactory({ attributes: { apiKey: '123' } });
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const proposals = await getEventProposals(event.slug, event.apiKey!);

    expect(proposals).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        abstract: proposal.abstract,
        languages: proposal.languages,
        level: proposal.level,
        categories: [],
        formats: [],
        speakers: [
          {
            name: speaker.name,
            bio: speaker.bio,
            photoURL: speaker.photoURL,
            company: speaker.company,
            github: speaker.github,
            twitter: speaker.twitter,
          },
        ],
      },
    ]);
  });
});
