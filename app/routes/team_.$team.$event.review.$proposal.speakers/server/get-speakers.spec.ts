import type { Event, Team, Proposal, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '~/libs/errors';
import { db } from '~/libs/db';
import { getSpeakers } from './get-speakers.server';
import { surveyFactory } from 'tests/factories/surveys';

describe('#getSpeakers', () => {
  let owner: User, speaker1: User, speaker2: User;
  let team: Team;
  let event: Event;
  let proposal: Proposal;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker1 = await userFactory({ traits: ['peter-parker'] });
    speaker2 = await userFactory({ traits: ['bruce-wayne'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
    });
  });
  afterEach(disconnectDB);

  it('returns speakers data of a proposal', async () => {
    const survey = await surveyFactory({
      event,
      user: speaker2,
      attributes: { answers: { gender: 'male', tshirt: 'XL' } },
    });

    const speakers = await getSpeakers(event.slug, proposal.id, owner.id);

    expect(speakers).toEqual([
      {
        id: speaker2.id,
        name: speaker2.name,
        email: speaker2.email,
        bio: speaker2.bio,
        address: speaker2.address,
        company: speaker2.company,
        picture: speaker2.picture,
        references: speaker2.references,
        socials: speaker2.socials,
        survey: survey.answers,
      },
      {
        id: speaker1.id,
        name: speaker1.name,
        email: speaker1.email,
        bio: speaker1.bio,
        address: speaker1.address,
        company: speaker1.company,
        picture: speaker1.picture,
        references: speaker1.references,
        socials: speaker1.socials,
        survey: undefined,
      },
    ]);
  });

  it('throws an error if display speakers setting is false', async () => {
    await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

    await expect(getSpeakers(event.slug, proposal.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(getSpeakers(event.slug, proposal.id, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
