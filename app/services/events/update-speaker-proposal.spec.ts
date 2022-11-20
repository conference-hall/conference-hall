import { TalkLevel } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { CfpNotOpenError, EventNotFoundError, ProposalNotFoundError } from '../errors';
import { getSpeakerProposal } from './get-speaker-proposal.server';
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

    await updateSpeakerProposal(event.slug, proposal.id, speaker.id, data);

    const result = await getSpeakerProposal(proposal.id, speaker.id);

    expect(result.title).toEqual(data.title);
    expect(result.abstract).toEqual(data.abstract);
    expect(result.level).toEqual(data.level);
    expect(result.languages).toEqual(data.languages);
    expect(result.references).toEqual(data.references);
    expect(result.formats.map(({ id }) => id)).toEqual(data.formats);
    expect(result.categories.map(({ id }) => id)).toEqual(data.categories);
  });

  it('throws an error when event does not exist', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    const data = {
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    };

    await expect(updateSpeakerProposal('XXX', proposal.id, speaker.id, data)).rejects.toThrowError(EventNotFoundError);
  });

  it('throws an error when CFP is not open', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-past'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    const data = {
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    };

    await expect(updateSpeakerProposal(event.slug, proposal.id, speaker.id, data)).rejects.toThrowError(
      CfpNotOpenError
    );
  });

  it('throws an error when proposal not found', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();

    const data = {
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    };

    await expect(updateSpeakerProposal(event.slug, 'XXX', speaker.id, data)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });

  it('throws an error when proposal does not belong to user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const proposal = await proposalFactory({ event, talk });

    const data = {
      title: 'change',
      abstract: 'change',
      level: null,
      languages: ['fr'],
      references: '',
      formats: [],
      categories: [],
    };

    await expect(updateSpeakerProposal(event.slug, proposal.id, speaker.id, data)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });
});
