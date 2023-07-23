import { TalkLevel } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';
import { CfpNotOpenError, EventNotFoundError, TalkNotFoundError } from '~/libs/errors';

import { saveDraftProposal } from './save-draft-proposal.server';

describe('#saveDraftProposal', () => {
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

    const { talkId } = await saveDraftProposal('new', event.slug, speaker.id, data);

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

    const { talkId } = await saveDraftProposal(talk.id, event.slug, speaker.id, data);

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

    await expect(saveDraftProposal('XXX', event.slug, speaker.id, data)).rejects.toThrowError(TalkNotFoundError);
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
    await expect(saveDraftProposal(talk.id, event.slug, user.id, data)).rejects.toThrowError(TalkNotFoundError);
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

    await expect(saveDraftProposal('new', event.slug, speaker.id, data)).rejects.toThrowError(CfpNotOpenError);
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

    await expect(saveDraftProposal('new', 'XXX', speaker.id, data)).rejects.toThrowError(EventNotFoundError);
  });
});
