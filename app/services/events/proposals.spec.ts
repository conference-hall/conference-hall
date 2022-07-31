import { TalkLevel } from '@prisma/client';
import { resetDB } from '../../../tests/db-helpers';
import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { inviteFactory } from '../../../tests/factories/invite';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { CfpNotOpenError, EventNotFoundError, InvitationNotFoundError, ProposalNotFoundError } from '../errors';
import {
  deleteProposal,
  fetchSpeakerProposals,
  getSpeakerProposal,
  inviteCoSpeakerToProposal,
  isTalkAlreadySubmitted,
  removeCoSpeakerFromProposal,
  updateProposal,
  validateProposalForm,
} from './proposals.server';

describe('#fetchSpeakerProposals', () => {
  afterEach(resetDB);

  it('returns event proposals of the speaker', async () => {
    const event = await eventFactory();
    const event2 = await eventFactory();

    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    await proposalFactory({ event: event2, talk });

    const otherSpeaker = await userFactory();
    const otherTalk = await talkFactory({ speakers: [otherSpeaker] });
    await proposalFactory({ event, talk: otherTalk });

    const results = await fetchSpeakerProposals(event.slug, speaker.id);

    expect(results).toEqual([
      {
        id: proposal.id,
        title: proposal.title,
        talkId: proposal.talkId,
        status: proposal.status,
        createdAt: proposal.createdAt.toUTCString(),
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            photoURL: speaker.photoURL,
          },
        ],
      },
    ]);
  });
});

describe('#isTalkAlreadySubmitted', () => {
  afterEach(resetDB);

  it('returns true if the talk already submitted for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['submitted'] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeTruthy();
  });

  it('returns false if the talk is submitted as draft for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeFalsy();
  });

  it('returns false if the talk is not submitted for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeFalsy();
  });

  it('returns false if the submitted talk belongs to another speaker', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    await proposalFactory({ event, talk, traits: ['submitted'] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeFalsy();
  });
});

describe('#getSpeakerProposal', () => {
  afterEach(resetDB);

  it('returns event proposals of the speaker', async () => {
    const event = await eventFactory();
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });

    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });
    const invite = await inviteFactory({ proposal });

    const result = await getSpeakerProposal(proposal.id, speaker.id);

    expect(result).toEqual({
      id: proposal.id,
      talkId: proposal.talkId,
      title: proposal.title,
      abstract: proposal.abstract,
      status: proposal.status,
      references: proposal.references,
      level: proposal.level,
      createdAt: proposal.createdAt.toUTCString(),
      languages: proposal.languages,
      invitationLink: `http://localhost/invitation/${invite?.id}`,
      formats: [{ id: format.id, name: format.name }],
      categories: [{ id: category.id, name: category.name }],
      speakers: [
        {
          id: speaker.id,
          name: speaker.name,
          photoURL: speaker.photoURL,
          isOwner: true,
        },
      ],
    });
  });

  it('throws an error when proposal does not exist', async () => {
    const speaker = await userFactory();

    await expect(getSpeakerProposal('XXX', speaker.id)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error when proposal does not belong to the user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const proposal = await proposalFactory({ event, talk });

    await expect(getSpeakerProposal(proposal.id, speaker.id)).rejects.toThrowError(ProposalNotFoundError);
  });
});

describe('#deleteProposal', () => {
  afterEach(resetDB);

  it('deletes a proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    await deleteProposal(proposal.id, speaker.id);

    const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

    expect(deleted).toBe(null);
  });

  it('does not delete a proposal if not belonging to user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const proposal = await proposalFactory({ event, talk });

    await deleteProposal(proposal.id, speaker.id);

    const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

    expect(deleted).not.toBe(1);
  });
});

describe('#updateProposal', () => {
  afterEach(resetDB);

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

    await updateProposal(event.slug, proposal.id, speaker.id, data);

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

    await expect(updateProposal('XXX', proposal.id, speaker.id, data)).rejects.toThrowError(EventNotFoundError);
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

    await expect(updateProposal(event.slug, proposal.id, speaker.id, data)).rejects.toThrowError(CfpNotOpenError);
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

    await expect(updateProposal(event.slug, 'XXX', speaker.id, data)).rejects.toThrowError(ProposalNotFoundError);
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

    await expect(updateProposal(event.slug, proposal.id, speaker.id, data)).rejects.toThrowError(ProposalNotFoundError);
  });
});

describe('#validateProposalForm', () => {
  it('validates fields', () => {
    const formData = new FormData();
    formData.append('title', 'Title changed');
    formData.append('abstract', 'Abstract changes');
    formData.append('references', 'References changes');
    formData.append('level', 'INTERMEDIATE');
    formData.append('languages[0]', 'en');
    formData.append('formats', 'F1');
    formData.append('formats', 'F2');
    formData.append('categories', 'C1');
    formData.append('categories', 'C2');

    const result = validateProposalForm(formData);

    expect(result.success && result.data).toEqual({
      title: 'Title changed',
      abstract: 'Abstract changes',
      references: 'References changes',
      level: 'INTERMEDIATE',
      languages: ['en'],
      formats: ['F1', 'F2'],
      categories: ['C1', 'C2'],
    });
  });

  it('validates mandatory fields', () => {
    const formData = new FormData();
    formData.append('title', '');
    formData.append('abstract', '');
    const result = validateProposalForm(formData);

    expect(!result.success && result.error.errors.map((e) => e.code)).toEqual(['too_small', 'too_small']);
  });
});

describe('#inviteCoSpeakerToProposal', () => {
  afterEach(resetDB);

  it('adds the speaker to the proposal and the talk', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const invite = await inviteFactory({ proposal });
    const cospeaker = await userFactory();

    await inviteCoSpeakerToProposal(invite?.id!, cospeaker.id);

    const resultProposal = await db.proposal.findUnique({
      where: { id: proposal.id },
      include: { speakers: true },
    });

    const speakersProposal = resultProposal?.speakers.map(({ id }) => id);
    expect(speakersProposal?.length).toBe(2);
    expect(speakersProposal).toContain(speaker.id);
    expect(speakersProposal).toContain(cospeaker.id);

    const resultTalk = await db.talk.findUnique({
      where: { id: talk.id },
      include: { speakers: true },
    });

    const speakersTalk = resultTalk?.speakers.map(({ id }) => id);
    expect(speakersTalk?.length).toBe(2);
    expect(speakersTalk).toContain(speaker.id);
    expect(speakersTalk).toContain(cospeaker.id);
  });

  it('throws an error when invitation not found', async () => {
    const speaker = await userFactory();
    await expect(inviteCoSpeakerToProposal('XXX', speaker.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#removeCoSpeakerFromProposal', () => {
  afterEach(resetDB);

  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromProposal(speaker.id, talk.id, event.slug, cospeaker.id);

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
      include: { speakers: true },
    });

    const speakers = proposalUpdated?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(1);
    expect(speakers).toContain(speaker.id);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    await proposalFactory({ event, talk });

    const updater = await userFactory();
    await expect(removeCoSpeakerFromProposal(updater.id, talk.id, event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });

  it('throws an error when talk not found', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromProposal(speaker.id, 'XXX', event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });
});
