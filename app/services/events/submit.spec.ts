import { TalkLevel } from '@prisma/client';
import { getEmails, resetEmails } from 'tests/email-helpers';
import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
  TalkNotFoundError,
} from '../errors';
import { getProposalInfo, saveDraftProposalForEvent, submitProposal } from './submit.server';

describe('#saveDraftProposalForEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('create a new draft proposal from scratch', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();

    const data = {
      title: 'New title',
      abstract: 'New abstract',
      references: 'New reference',
      languages: ['en'],
      level: TalkLevel.ADVANCED,
    };

    const { talkId } = await saveDraftProposalForEvent('new', event.slug, speaker.id, data);

    const talk = await db.talk.findUnique({ where: { id: talkId }, include: { speakers: true } });
    expect(talk?.title).toEqual(data.title);
    expect(talk?.abstract).toEqual(data.abstract);
    expect(talk?.references).toEqual(data.references);
    expect(talk?.languages).toEqual(data.languages);
    expect(talk?.level).toEqual(data.level);
    expect(talk?.speakers[0].id).toEqual(speaker.id);

    const proposal = await db.proposal.findFirst({ where: { talkId }, include: { speakers: true } });
    expect(proposal?.title).toEqual(data.title);
    expect(proposal?.abstract).toEqual(data.abstract);
    expect(proposal?.references).toEqual(data.references);
    expect(proposal?.status).toEqual('DRAFT');
    expect(proposal?.eventId).toEqual(event.id);
    expect(proposal?.languages).toEqual(data.languages);
    expect(proposal?.level).toEqual(data.level);
    expect(proposal?.speakers[0].id).toEqual(speaker.id);
  });

  it('create a new draft proposal from a existing talk', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    const data = {
      title: 'New title',
      abstract: 'New abstract',
      references: 'New reference',
      languages: ['de'],
      level: TalkLevel.ADVANCED,
    };

    const { talkId } = await saveDraftProposalForEvent(talk.id, event.slug, speaker.id, data);

    const updatedTalk = await db.talk.findUnique({ where: { id: talkId }, include: { speakers: true } });
    expect(updatedTalk?.title).toEqual(data.title);
    expect(updatedTalk?.abstract).toEqual(data.abstract);
    expect(updatedTalk?.references).toEqual(data.references);
    expect(updatedTalk?.languages).toEqual(data.languages);
    expect(updatedTalk?.level).toEqual(data.level);
    expect(updatedTalk?.speakers[0].id).toEqual(speaker.id);

    const proposal = await db.proposal.findFirst({ where: { talkId }, include: { speakers: true } });
    expect(proposal?.title).toEqual(data.title);
    expect(proposal?.abstract).toEqual(data.abstract);
    expect(proposal?.references).toEqual(data.references);
    expect(proposal?.status).toEqual('DRAFT');
    expect(proposal?.eventId).toEqual(event.id);
    expect(proposal?.languages).toEqual(data.languages);
    expect(proposal?.level).toEqual(data.level);
    expect(proposal?.speakers[0].id).toEqual(speaker.id);
  });

  it('throws an error when talk not found', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const data = {
      title: 'New title',
      abstract: 'New abstract',
      references: 'New reference',
      languages: ['en'],
      level: TalkLevel.ADVANCED,
    };

    await expect(saveDraftProposalForEvent('XXX', event.slug, speaker.id, data)).rejects.toThrowError(
      TalkNotFoundError
    );
  });

  it('throws an error when talk not belong to the user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    const data = {
      title: 'New title',
      abstract: 'New abstract',
      references: 'New reference',
      languages: ['en'],
      level: TalkLevel.ADVANCED,
    };

    const user = await userFactory();
    await expect(saveDraftProposalForEvent(talk.id, event.slug, user.id, data)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when CFP is not open', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-past'] });
    const speaker = await userFactory();
    const data = {
      title: 'New title',
      abstract: 'New abstract',
      references: 'New reference',
      languages: ['en'],
      level: TalkLevel.ADVANCED,
    };

    await expect(saveDraftProposalForEvent('new', event.slug, speaker.id, data)).rejects.toThrowError(CfpNotOpenError);
  });

  it('throws an error when event not found', async () => {
    const speaker = await userFactory();
    const data = {
      title: 'New title',
      abstract: 'New abstract',
      references: 'New reference',
      languages: ['en'],
      level: TalkLevel.ADVANCED,
    };

    await expect(saveDraftProposalForEvent('new', 'XXX', speaker.id, data)).rejects.toThrowError(EventNotFoundError);
  });
});

describe('#getProposalInfo', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns info about the proposal submitted on event', async () => {
    const event = await eventFactory();
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });

    const result = await getProposalInfo(talk.id, event.id, speaker.id);

    expect(result).toEqual({
      title: proposal.title,
      speakers: [{ name: speaker.name, photoURL: speaker.photoURL }],
      formats: [format.name],
      categories: [category.name],
    });
  });

  it('throws an error if talk does not have proposal for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await expect(getProposalInfo(talk.id, event.id, speaker.id)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error if proposal does not belong to user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk });

    const user = await userFactory();
    await expect(getProposalInfo(talk.id, event.id, user.id)).rejects.toThrowError(ProposalNotFoundError);
  });
});

describe('#submitProposal', () => {
  beforeEach(async () => {
    await resetEmails();
    await resetDB();
  });
  afterEach(disconnectDB);

  it('submit a proposal', async () => {
    const event = await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['submitted'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk: talk, traits: ['draft'] });
    const data = { message: 'User message' };

    await submitProposal(talk.id, event.slug, speaker.id, data);

    const result = await db.proposal.findUnique({ where: { id: proposal.id } });
    expect(result?.status).toEqual('SUBMITTED');
    expect(result?.comments).toEqual('User message');

    const emails = await getEmails();
    expect(emails.total).toBe(2);
    expect(emails.to(speaker.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Submission confirmed`,
      },
    ]);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] New proposal received`,
      },
    ]);
  });

  it('can submit if more drafts than event max proposals', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 1 } });
    const speaker = await userFactory();
    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk1, traits: ['draft'] });
    const talk2 = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk: talk2, traits: ['draft'] });
    const data = { message: 'User message' };

    await submitProposal(talk2.id, event.slug, speaker.id, data);

    const result = await db.proposal.findUnique({ where: { id: proposal.id } });
    expect(result?.status).toEqual('SUBMITTED');
    expect(result?.comments).toEqual('User message');
  });

  it('throws an error when max proposal submitted reach', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 1 } });
    const speaker = await userFactory();
    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk1 });
    const talk2 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk2, traits: ['draft'] });
    const data = { message: 'User message' };

    await expect(submitProposal(talk2.id, event.slug, speaker.id, data)).rejects.toThrowError(
      MaxSubmittedProposalsReachedError
    );
  });

  it('throws an error when talk not belong to the user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });
    const data = { message: 'User message' };

    const user = await userFactory();
    await expect(submitProposal(talk.id, event.slug, user.id, data)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error when CFP is not open', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-past'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const data = { message: 'User message' };

    await expect(submitProposal(talk.id, event.slug, speaker.id, data)).rejects.toThrowError(CfpNotOpenError);
  });

  it('throws an error when event not found', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const data = { message: 'User message' };

    await expect(submitProposal(talk.id, 'XXX', speaker.id, data)).rejects.toThrowError(EventNotFoundError);
  });
});
