import type { Event, EventCategory, EventFormat, Organization, Proposal, User } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import {
  addProposalComment,
  checkOrganizerEventAccess,
  removeProposalComment,
  updateProposalsStatus,
} from './event.server';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { ratingFactory } from 'tests/factories/ratings';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { getProposalReview } from './event.server';
import { EventNotFoundError, ForbiddenOperationError } from '../errors';
import { db } from '../db';
import { messageFactory } from 'tests/factories/messages';
import {
  getEvent,
  searchProposals,
  rateProposal,
  createEvent,
  deleteCategory,
  deleteFormat,
  saveCategory,
  saveFormat,
  updateEvent,
  updateProposal,
} from './event.server';
import type { ProposalsFilters } from '~/schemas/proposal';

describe('#checkOrganizerEventAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the organizer role when user has access to the event', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });

    const result = await checkOrganizerEventAccess(organization.slug, event.slug, user.id);

    expect(result).toEqual('OWNER');
  });

  it('returns the organizer role if user role part of accepted ones', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });

    const result = await checkOrganizerEventAccess(organization.slug, event.slug, user.id, ['OWNER']);

    expect(result).toEqual('OWNER');
  });

  it('throws an error if user role is not in the accepted role list', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });
    await expect(checkOrganizerEventAccess(organization.slug, event.slug, user.id, ['MEMBER'])).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user role is not part of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory();
    const event = await eventFactory({ organization });
    await expect(checkOrganizerEventAccess(organization.slug, event.slug, user.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if event does not exist', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    await expect(checkOrganizerEventAccess(organization.slug, 'AAAA', user.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#getEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the event for organizer', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({
      attributes: {
        name: 'Awesome event',
        slug: 'event',
        visibility: 'PUBLIC',
      },
      traits: ['conference-cfp-open'],
      organization,
    });

    const result = await getEvent(event.slug, user.id);

    expect(result).toEqual({
      id: event.id,
      name: event.name,
      slug: event.slug,
      type: event.type,
      address: event.address,
      conferenceStart: event.conferenceStart?.toUTCString(),
      conferenceEnd: event.conferenceEnd?.toUTCString(),
      description: event.description,
      visibility: event.visibility,
      websiteUrl: event.websiteUrl,
      codeOfConductUrl: event.codeOfConductUrl,
      contactEmail: event.contactEmail,
      bannerUrl: event.bannerUrl,
      maxProposals: event.maxProposals,
      surveyEnabled: event.surveyEnabled,
      surveyQuestions: [],
      deliberationEnabled: event.deliberationEnabled,
      displayOrganizersRatings: event.displayOrganizersRatings,
      displayProposalsRatings: event.displayProposalsRatings,
      displayProposalsSpeakers: event.displayProposalsSpeakers,
      formatsRequired: event.formatsRequired,
      categoriesRequired: event.categoriesRequired,
      emailOrganizer: event.emailOrganizer,
      emailNotifications: [],
      slackWebhookUrl: event.slackWebhookUrl,
      apiKey: event.apiKey,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: 'OPENED',
      formats: [],
      categories: [],
    });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    await expect(getEvent(event.slug, user.id)).rejects.toThrowError(EventNotFoundError);
  });
});

describe('#searchProposals', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event, event2: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    event2 = await eventFactory();
  });
  afterEach(disconnectDB);

  it('returns event proposals info', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [owner] }) });

    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.filters).toEqual({});
    expect(proposals.pagination).toEqual({ current: 1, total: 1 });
    expect(proposals.results.length).toEqual(1);
    expect(proposals.results).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        emailAcceptedStatus: null,
        emailRejectedStatus: null,
        speakers: [speaker.name],
        ratings: { negatives: 0, positives: 0, you: null, total: null },
      },
    ]);
  });

  describe('with filters and sorting', () => {
    let proposal1: Proposal, proposal2: Proposal, proposal3: Proposal;

    beforeEach(async () => {
      const talk1 = await talkFactory({ speakers: [speaker] });
      const talk2 = await talkFactory({ speakers: [owner] });
      const talk3 = await talkFactory({ speakers: [speaker, owner] });

      proposal1 = await proposalFactory({
        event,
        talk: talk1,
        attributes: { title: 'Hello World' },
        formats: [format],
        traits: ['submitted'],
      });
      proposal2 = await proposalFactory({
        event,
        talk: talk2,
        attributes: { title: 'Awesome talk' },
        categories: [category],
        traits: ['accepted'],
      });
      proposal3 = await proposalFactory({
        event,
        talk: talk3,
        attributes: { title: 'Foo bar talk' },
        traits: ['rejected'],
      });
    });

    it('filters proposals by title', async () => {
      const filters = { query: 'world' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.filters).toEqual(filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal1.id);
    });

    it('filters proposals by speaker name', async () => {
      const filters = { query: 'parker' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(2);
      expect(proposals.results[0].id).toBe(proposal3.id);
      expect(proposals.results[1].id).toBe(proposal1.id);
    });

    it('filters proposals by formats', async () => {
      const filters = { formats: format.id };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal1.id);
    });

    it('filters proposals by categories', async () => {
      const filters = { categories: category.id };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal2.id);
    });

    it('filters proposals by status', async () => {
      const filters: ProposalsFilters = { status: ['ACCEPTED'] };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal2.id);
    });

    it('filters proposals by user rated only', async () => {
      await ratingFactory({ user: owner, proposal: proposal1 });
      const filters: ProposalsFilters = { ratings: 'rated' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(1);
      expect(proposals.results[0].id).toBe(proposal1.id);
    });

    it('filters proposals by user not rated only', async () => {
      await ratingFactory({ user: owner, proposal: proposal1 });
      const filters: ProposalsFilters = { ratings: 'not-rated' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(2);
      expect(proposals.results[0].id).toBe(proposal3.id);
      expect(proposals.results[1].id).toBe(proposal2.id);
    });

    it('sorts by newest (default)', async () => {
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});
      expect(proposals.results.length).toBe(3);
      expect(proposals.results[0].id).toBe(proposal3.id);
      expect(proposals.results[1].id).toBe(proposal2.id);
      expect(proposals.results[2].id).toBe(proposal1.id);
    });

    it('sorts by oldest', async () => {
      const filters: ProposalsFilters = { sort: 'oldest' };
      const proposals = await searchProposals(organization.slug, event.slug, owner.id, filters);
      expect(proposals.results.length).toBe(3);
      expect(proposals.results[0].id).toBe(proposal1.id);
      expect(proposals.results[1].id).toBe(proposal2.id);
      expect(proposals.results[2].id).toBe(proposal3.id);
    });

    it.todo('sort by lowest ratings');
    it.todo('sort by highest ratings');
  });

  it('returns the given page', async () => {
    await Promise.all(
      Array.from({ length: 26 }).map(async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        return proposalFactory({ event, talk });
      })
    );

    const result = await searchProposals(organization.slug, event.slug, owner.id, {}, 1);
    expect(result.total).toBe(26);
    expect(result.results.length).toBe(25);
    expect(result.pagination.current).toBe(1);
    expect(result.pagination.total).toBe(2);

    const result2 = await searchProposals(organization.slug, event.slug, owner.id, {}, 2);
    expect(result2.results.length).toBe(1);
    expect(result2.pagination.current).toBe(2);
    expect(result2.pagination.total).toBe(2);

    const result3 = await searchProposals(organization.slug, event.slug, owner.id, {}, -1);
    expect(result3.results.length).toBe(25);
    expect(result3.pagination.current).toBe(1);

    const result4 = await searchProposals(organization.slug, event.slug, owner.id, {}, 10);
    expect(result4.results.length).toBe(1);
    expect(result4.pagination.current).toBe(2);
  });

  it('returns empty results of an event without proposals', async () => {
    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.filters).toEqual({});
    expect(proposals.pagination).toEqual({ current: 1, total: 0 });
    expect(proposals.results).toEqual([]);
  });

  it('should not return draft proposals', async () => {
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });

    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.total).toBe(0);
    expect(proposals.results).toEqual([]);
  });

  it('returns users ratings', async () => {
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    await ratingFactory({ user: speaker, proposal, attributes: { feeling: 'NEGATIVE', rating: 0 } });
    await ratingFactory({ user: owner, proposal, attributes: { feeling: 'POSITIVE', rating: 5 } });

    const proposals = await searchProposals(organization.slug, event.slug, owner.id, {});

    expect(proposals.total).toBe(1);
    expect(proposals.results[0].ratings).toEqual({ negatives: 1, positives: 1, you: 5, total: 2.5 });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(searchProposals(organization.slug, event.slug, user.id, {})).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

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

describe('#rateProposal', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('adds then updates a rating for a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await rateProposal(organization.slug, event.slug, proposal.id, owner.id, {
      feeling: 'NEUTRAL',
      rating: 2,
    });

    const ratings = await db.rating.findMany({ where: { userId: owner.id } });
    expect(ratings.length).toBe(1);

    const rating = ratings[0];
    expect(rating.feeling).toBe('NEUTRAL');
    expect(rating.rating).toBe(2);

    await rateProposal(organization.slug, event.slug, proposal.id, owner.id, {
      feeling: 'POSITIVE',
      rating: 5,
    });

    const updatedRatings = await db.rating.findMany({ where: { userId: owner.id } });
    expect(updatedRatings.length).toBe(1);

    const updatedRating = updatedRatings[0];
    expect(updatedRating.feeling).toBe('POSITIVE');
    expect(updatedRating.rating).toBe(5);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      rateProposal(organization.slug, event.slug, proposal.id, user.id, { feeling: 'NEUTRAL', rating: 2 })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#addProposalComment', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('adds message to a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await addProposalComment(organization.slug, event.slug, proposal.id, owner.id, 'My message');

    const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
    expect(messages.length).toBe(1);

    const message = messages[0];
    expect(message.message).toBe('My message');
    expect(message.channel).toBe(MessageChannel.ORGANIZER);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      addProposalComment(organization.slug, event.slug, proposal.id, user.id, 'My message')
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#removeProposalComment', () => {
  let owner: User, member: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    member = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('removes a message from a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user: owner, proposal });

    await removeProposalComment(organization.slug, event.slug, proposal.id, owner.id, message.id);

    const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
    expect(messages.length).toBe(0);
  });

  it('removes a message from a proposal only if it belongs to the user', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user: member, proposal });

    await removeProposalComment(organization.slug, event.slug, proposal.id, owner.id, message.id);

    const messages = await db.message.findMany({ where: { userId: member.id, proposalId: proposal.id } });
    expect(messages.length).toBe(1);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user, proposal });
    await expect(
      removeProposalComment(organization.slug, event.slug, proposal.id, user.id, message.id)
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#updateProposal', () => {
  let owner: User, reviewer: User, speaker: User;
  let organization: Organization;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;
  let proposal: Proposal;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
  });
  afterEach(disconnectDB);

  it('updates the proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const updated = await updateProposal(organization.slug, event.slug, proposal.id, owner.id, {
      title: 'Updated',
      abstract: 'Updated',
      level: 'ADVANCED',
      references: 'Updated',
      languages: [],
      formats: [format.id],
      categories: [category.id],
    });

    expect(updated.title).toBe('Updated');
    expect(updated.abstract).toBe('Updated');
    expect(updated.level).toBe('ADVANCED');
    expect(updated.references).toBe('Updated');

    const formatCount = await db.eventFormat.count({ where: { proposals: { some: { id: proposal.id } } } });
    expect(formatCount).toBe(1);

    const categoryCount = await db.eventCategory.count({ where: { proposals: { some: { id: proposal.id } } } });
    expect(categoryCount).toBe(1);
  });

  it('throws an error if user has not a owner or member role in the organization', async () => {
    await expect(
      updateProposal(organization.slug, event.slug, proposal.id, reviewer.id, {
        title: 'Updated',
        abstract: 'Updated',
        level: null,
        references: null,
        languages: [],
      })
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      updateProposal(organization.slug, event.slug, proposal.id, user.id, {
        title: 'Updated',
        abstract: 'Updated',
        level: null,
        references: null,
        languages: [],
      })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#createEvent', () => {
  let owner: User, reviewer: User;
  let organization: Organization;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
  });
  afterEach(disconnectDB);

  it('creates a new event into the organization', async () => {
    const created = await createEvent(organization.slug, owner.id, {
      type: 'CONFERENCE',
      name: 'Hello world',
      slug: 'hello-world',
      visibility: 'PUBLIC',
    });

    expect(created.slug).toBe('hello-world');

    const event = await db.event.findUnique({ where: { slug: created.slug } });
    expect(event?.type).toBe('CONFERENCE');
    expect(event?.name).toBe('Hello world');
    expect(event?.slug).toBe('hello-world');
    expect(event?.visibility).toBe('PUBLIC');
    expect(event?.organizationId).toBe(organization.id);
    expect(event?.creatorId).toBe(owner.id);
  });

  it('returns an error message when slug already exists', async () => {
    await eventFactory({ organization, attributes: { slug: 'hello-world' } });

    const created = await createEvent(organization.slug, owner.id, {
      type: 'CONFERENCE',
      name: 'Hello world',
      slug: 'hello-world',
      visibility: 'PUBLIC',
    });

    expect(created?.error?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });

  it('throws an error if user is not owner', async () => {
    await expect(
      createEvent(organization.slug, reviewer.id, {
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
      })
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(
      createEvent(organization.slug, user.id, {
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
      })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#updateEvent', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('creates a new event into the organization', async () => {
    const created = await updateEvent(organization.slug, event.slug, owner.id, {
      name: 'Updated',
      slug: 'updated',
      visibility: 'PUBLIC',
      address: 'Address',
      description: 'Updated',
      categoriesRequired: true,
      formatsRequired: true,
      codeOfConductUrl: 'codeOfConductUrl',
      emailNotifications: ['submitted'],
      bannerUrl: 'Banner',
      apiKey: 'apiKey',
    });

    expect(created.slug).toBe('updated');

    const updated = await db.event.findUnique({ where: { slug: created.slug } });
    expect(updated?.name).toBe('Updated');
    expect(updated?.slug).toBe('updated');
    expect(updated?.visibility).toBe('PUBLIC');
    expect(updated?.address).toBe('Address');
    expect(updated?.categoriesRequired).toBe(true);
    expect(updated?.formatsRequired).toBe(true);
    expect(updated?.description).toBe('Updated');
    expect(updated?.bannerUrl).toBe('Banner');
    expect(updated?.codeOfConductUrl).toBe('codeOfConductUrl');
    expect(updated?.emailNotifications).toEqual(['submitted']);
    expect(updated?.apiKey).toBe('apiKey');
  });

  it.todo('test address geocoding');

  it('returns an error message when slug already exists', async () => {
    await eventFactory({ organization, attributes: { slug: 'hello-world' } });
    const created = await updateEvent(organization.slug, event.slug, owner.id, { slug: 'hello-world' });
    expect(created?.error?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });

  it('throws an error if user is not owner', async () => {
    await expect(updateEvent(organization.slug, event.slug, reviewer.id, { name: 'Hello world' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(updateEvent(organization.slug, event.slug, user.id, { name: 'Hello world' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

it.todo('#uploadAndSaveEventBanner');

describe('#saveFormat', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('adds a new format', async () => {
    await saveFormat(organization.slug, event.slug, owner.id, {
      name: 'Format 1',
      description: 'Format 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });

    expect(updated?.formats.length).toBe(1);
    expect(updated?.formats[0].name).toBe('Format 1');
    expect(updated?.formats[0].description).toBe('Format 1');
  });

  it('updates an event format', async () => {
    const format = await eventFormatFactory({ event, attributes: { name: 'name', description: 'desc' } });
    await saveFormat(organization.slug, event.slug, owner.id, {
      id: format.id,
      name: 'Format 1',
      description: 'Format 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });

    expect(updated?.formats.length).toBe(1);
    expect(updated?.formats[0].name).toBe('Format 1');
    expect(updated?.formats[0].description).toBe('Format 1');
  });

  it('throws an error if user is not owner', async () => {
    await expect(
      saveFormat(organization.slug, event.slug, reviewer.id, { name: 'Hello world', description: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(
      saveFormat(organization.slug, event.slug, user.id, { name: 'Hello world', description: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#saveCategory', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('adds a new category', async () => {
    await saveCategory(organization.slug, event.slug, owner.id, {
      name: 'Category 1',
      description: 'Category 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });

    expect(updated?.categories.length).toBe(1);
    expect(updated?.categories[0].name).toBe('Category 1');
    expect(updated?.categories[0].description).toBe('Category 1');
  });

  it('updates an event category', async () => {
    const category = await eventCategoryFactory({ event, attributes: { name: 'name', description: 'desc' } });
    await saveCategory(organization.slug, event.slug, owner.id, {
      id: category.id,
      name: 'Category 1',
      description: 'Category 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });

    expect(updated?.categories.length).toBe(1);
    expect(updated?.categories[0].name).toBe('Category 1');
    expect(updated?.categories[0].description).toBe('Category 1');
  });

  it('throws an error if user is not owner', async () => {
    await expect(
      saveCategory(organization.slug, event.slug, reviewer.id, { name: 'Hello world', description: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(
      saveCategory(organization.slug, event.slug, user.id, { name: 'Hello world', description: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#deleteFormat', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;
  let format: EventFormat;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
    format = await eventFormatFactory({ event });
  });
  afterEach(disconnectDB);

  it('deletes an event format', async () => {
    await deleteFormat(organization.slug, event.slug, owner.id, format.id);
    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });
    expect(updated?.formats.length).toBe(0);
  });

  it('throws an error if user is not owner', async () => {
    await expect(deleteFormat(organization.slug, event.slug, reviewer.id, format.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(deleteFormat(organization.slug, event.slug, user.id, format.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#deleteCategory', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;
  let category: EventCategory;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
    category = await eventCategoryFactory({ event });
  });
  afterEach(disconnectDB);

  it('deletes an event category', async () => {
    await deleteCategory(organization.slug, event.slug, owner.id, category.id);
    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });
    expect(updated?.categories.length).toBe(0);
  });

  it('throws an error if user is not owner', async () => {
    await expect(deleteCategory(organization.slug, event.slug, reviewer.id, category.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(deleteCategory(organization.slug, event.slug, user.id, category.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#updateProposalsStatus', () => {
  let owner: User, reviewer: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('updates the proposal', async () => {
    const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const updatedCount = await updateProposalsStatus(
      organization.slug,
      event.slug,
      owner.id,
      [proposal1.id, proposal2.id],
      'ACCEPTED'
    );

    expect(updatedCount).toBe(2);
    const proposals = await db.proposal.findMany();
    expect(proposals[0].status).toBe('ACCEPTED');
    expect(proposals[1].status).toBe('ACCEPTED');
  });

  it('throws an error if user has not a owner or member role in the organization', async () => {
    await expect(
      updateProposalsStatus(organization.slug, event.slug, reviewer.id, [], 'ACCEPTED')
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      updateProposalsStatus(organization.slug, event.slug, user.id, [proposal.id], 'ACCEPTED')
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
