import type { Event, EventCategory, EventFormat, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { messageFactory } from 'tests/factories/messages';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { ratingFactory } from 'tests/factories/ratings';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../libs/errors';
import { getProposalReview } from './get-proposal-review.server';

describe('#getProposalReview', () => {
  let owner: User, member: User, speaker: User;
  let organization: Organization;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    organization = await organizationFactory({ owners: [owner, member] });
    event = await eventFactory({ organization });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
  });
  afterEach(disconnectDB);

  it('returns proposal review data', async () => {
    const proposal = await proposalFactory({
      event,
      formats: [format],
      categories: [category],
      talk: await talkFactory({ speakers: [speaker] }),
    });

    const reviewInfo = await getProposalReview(organization.slug, event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.pagination).toEqual({ current: 1, total: 1, previousId: proposal.id, nextId: proposal.id });
    expect(reviewInfo.proposal).toEqual({
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      comments: proposal.comments,
      level: proposal.level,
      languages: ['en'],
      formats: [{ id: format.id, name: format.name }],
      categories: [{ id: category.id, name: category.name }],
      speakers: [
        {
          id: speaker.id,
          name: speaker.name,
          photoURL: speaker.photoURL,
          bio: speaker.bio,
          references: speaker.references,
          email: speaker.email,
          company: speaker.company,
          address: speaker.address,
          github: speaker.github,
          twitter: speaker.twitter,
        },
      ],
      rating: {
        average: null,
        positives: 0,
        negatives: 0,
        userRating: { rating: undefined, feeling: undefined },
        membersRatings: [],
      },
      messages: [],
    });
  });

  it('returns organizers ratings', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await ratingFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', rating: 0 } });
    await ratingFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', rating: 5 } });

    const reviewInfo = await getProposalReview(organization.slug, event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.rating).toEqual({
      average: 2.5,
      positives: 1,
      negatives: 1,
      userRating: { rating: 0, feeling: 'NEGATIVE' },
      membersRatings: [
        {
          id: owner.id,
          name: owner.name,
          photoURL: owner.photoURL,
          feeling: 'NEGATIVE',
          rating: 0,
        },
        {
          id: member.id,
          name: member.name,
          photoURL: member.photoURL,
          feeling: 'POSITIVE',
          rating: 5,
        },
      ],
    });
  });

  it('returns organizers messages', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message1 = await messageFactory({ proposal, user: owner, attributes: { message: 'Message 1' } });
    const message2 = await messageFactory({ proposal, user: member, attributes: { message: 'Message 2' } });

    const reviewInfo = await getProposalReview(organization.slug, event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.messages).toEqual([
      {
        id: message2.id,
        userId: member.id,
        name: member.name,
        photoURL: member.photoURL,
        message: 'Message 2',
      },
      {
        id: message1.id,
        userId: owner.id,
        name: owner.name,
        photoURL: owner.photoURL,
        message: 'Message 1',
      },
    ]);
  });

  it('returns pagination for next and previous proposals', async () => {
    const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposal3 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const reviewInfo = await getProposalReview(organization.slug, event.slug, proposal2.id, owner.id, {});

    expect(reviewInfo.pagination).toEqual({
      current: 2,
      total: 3,
      nextId: proposal1.id,
      previousId: proposal3.id,
    });
  });

  it('returns pagination for next and previous proposals with filters', async () => {
    const proposal1 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker], attributes: { title: 'bar' } }) });
    const proposal3 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker], attributes: { title: 'bar' } }) });
    const proposal5 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
    });

    const reviewInfo = await getProposalReview(organization.slug, event.slug, proposal3.id, owner.id, { query: 'foo' });

    expect(reviewInfo.pagination).toEqual({
      current: 2,
      total: 3,
      nextId: proposal1.id,
      previousId: proposal5.id,
    });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(getProposalReview(organization.slug, event.slug, proposal.id, user.id, {})).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
