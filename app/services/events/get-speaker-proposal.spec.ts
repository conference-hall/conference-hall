import type { Event, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { inviteFactory } from 'tests/factories/invite';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ProposalNotFoundError } from '../errors';
import { getSpeakerProposal } from './get-speaker-proposal.server';

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
