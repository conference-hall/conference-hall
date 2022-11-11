import type { Event, User } from '@prisma/client';
import { TalkLevel } from '@prisma/client';
import { getEmails, resetEmails } from 'tests/email-helpers';
import { resetDB, disconnectDB } from '../../../tests/db-helpers';
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
  removeCoSpeakerFromTalkAndEvent,
  sendProposalParticipation,
  updateProposal,
} from './proposals.server';

describe('#fetchSpeakerProposals', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: true,
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

  describe('return proposals statuses', () => {
    let event: Event;
    let speaker: User;

    beforeEach(async () => {
      event = await eventFactory();
      speaker = await userFactory();
    });

    it('returns draft proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['draft'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: true,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns accepted proposal but not notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['accepted'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns accepted proposal and notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['acceptedAndNotified'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: true,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns rejected proposal but not notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['rejected'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns rejected proposal and notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['rejectedAndNotified'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: true,
        isSubmitted: false,
      });
    });

    it('returns confirmed proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['confirmed'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: false,
        isConfirmed: true,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns declined proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['declined'] });
      const results = await fetchSpeakerProposals(event.slug, speaker.id);
      expect(results[0]).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: true,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });
  });
});

describe('#isTalkAlreadySubmitted', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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
      references: proposal.references,
      level: proposal.level,
      createdAt: proposal.createdAt.toUTCString(),
      languages: proposal.languages,
      invitationLink: `http://localhost:3001/invitation/${invite?.id}`,
      isAccepted: false,
      isConfirmed: false,
      isDeclined: false,
      isDraft: false,
      isRejected: false,
      isSubmitted: true,
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

  describe('return proposal statuses', () => {
    let event: Event;
    let speaker: User;

    beforeEach(async () => {
      event = await eventFactory();
      speaker = await userFactory();
    });

    it('returns draft proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['draft'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: true,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns accepted proposal but not notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns accepted proposal and notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['acceptedAndNotified'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: true,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns rejected proposal but not notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['rejected'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns rejected proposal and notified', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['rejectedAndNotified'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: false,
        isDraft: false,
        isRejected: true,
        isSubmitted: false,
      });
    });

    it('returns confirmed proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['confirmed'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: false,
        isConfirmed: true,
        isDeclined: false,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
    });

    it('returns declined proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['declined'] });
      const result = await getSpeakerProposal(proposal.id, speaker.id);
      expect(result).toContain({
        isAccepted: false,
        isConfirmed: false,
        isDeclined: true,
        isDraft: false,
        isRejected: false,
        isSubmitted: false,
      });
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
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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

describe('#inviteCoSpeakerToProposal', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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

describe('#removeCoSpeakerFromTalkAndEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromTalkAndEvent(speaker.id, talk.id, event.slug, cospeaker.id);

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
    await expect(removeCoSpeakerFromTalkAndEvent(updater.id, talk.id, event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });

  it('throws an error when talk not found', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromTalkAndEvent(speaker.id, 'XXX', event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });
});

describe('#removeCoSpeakerFromProposal', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromProposal(speaker.id, proposal.id, cospeaker.id);

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
    const proposal = await proposalFactory({ event, talk });

    const updater = await userFactory();
    await expect(removeCoSpeakerFromProposal(updater.id, proposal.id, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromProposal(speaker.id, 'XXX', cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });
});

describe('#sendProposalParticipation', () => {
  beforeEach(async () => {
    await resetEmails();
    await resetDB();
  });
  afterEach(disconnectDB);

  it('confirms a proposal', async () => {
    const event = await eventFactory({
      attributes: { emailOrganizer: 'ben@email.com', emailNotifications: ['confirmed'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendProposalParticipation(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('CONFIRMED');

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Talk confirmed by speaker`,
      },
    ]);
  });

  it('declines a proposal', async () => {
    const event = await eventFactory({
      attributes: { emailOrganizer: 'ben@email.com', emailNotifications: ['declined'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendProposalParticipation(speaker.id, proposal.id, 'DECLINED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('DECLINED');

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Talk declined by speaker`,
      },
    ]);
  });

  it('cannot confirm or declined a not accepted proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['submitted'] });

    await sendProposalParticipation(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('SUBMITTED');
  });

  it('throws an error when proposal not found', async () => {
    const speaker = await userFactory();
    await expect(sendProposalParticipation(speaker.id, 'XXX', 'CONFIRMED')).rejects.toThrowError(ProposalNotFoundError);
  });
});
