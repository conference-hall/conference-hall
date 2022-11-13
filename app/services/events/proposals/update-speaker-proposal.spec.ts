import { TalkLevel } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '~/services/db';
import { updateSpeakerProposal } from './update-speaker-proposal.server';

describe('#updateSpeakerProposal', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates the proposal and the related talk', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });

    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    const data = {
      title: 'Title changed',
      abstract: 'Abstract changes',
      level: TalkLevel.INTERMEDIATE,
      languages: ['be'],
      references: 'Reference changed',
      formats: [format.id],
      categories: [category.id],
    };

    await updateSpeakerProposal({ eventSlug: event.slug, speakerId: speaker.id, proposalId: proposal.id, ...data });

    const result = await db.proposal.findFirst({
      where: { id: proposal.id },
      include: { formats: true, categories: true },
    });

    expect(result?.title).toEqual(data.title);
    expect(result?.abstract).toEqual(data.abstract);
    expect(result?.level).toEqual(data.level);
    expect(result?.languages).toEqual(data.languages);
    expect(result?.references).toEqual(data.references);
    expect(result?.formats.map(({ id }) => id)).toEqual(data.formats);
    expect(result?.categories.map(({ id }) => id)).toEqual(data.categories);
  });

  it('throws an error when event does not exist', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    const result = await updateSpeakerProposal({
      eventSlug: 'XXX',
      speakerId: speaker.id,
      proposalId: proposal.id,
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    });

    expect(result.errors[0].message).toBe('Event not found');
  });

  it('throws an error when CFP is not open', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-past'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    const result = await updateSpeakerProposal({
      eventSlug: event.slug,
      speakerId: speaker.id,
      proposalId: proposal.id,
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    });

    expect(result.errors[0].message).toBe('CFP not open');
  });

  it('throws an error when proposal not found', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();

    const result = await updateSpeakerProposal({
      eventSlug: event.slug,
      speakerId: speaker.id,
      proposalId: 'XXX',
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    });

    expect(result.errors[0].message).toBe('Proposal not found');
  });

  it('throws an error when proposal does not belong to user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const proposal = await proposalFactory({ event, talk });

    const result = await updateSpeakerProposal({
      eventSlug: event.slug,
      speakerId: speaker.id,
      proposalId: proposal.id,
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    });

    expect(result.errors[0].message).toBe('Proposal not found');
  });
});
