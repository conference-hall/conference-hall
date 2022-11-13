import type { Event, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { listSpeakerProposals } from './list-speaker-proposals.server';

describe('#listSpeakerProposals', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns proposals of the speaker for an event', async () => {
    const event = await eventFactory();
    const event2 = await eventFactory();

    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    await proposalFactory({ event: event2, talk });

    const otherSpeaker = await userFactory();
    const otherTalk = await talkFactory({ speakers: [otherSpeaker] });
    await proposalFactory({ event, talk: otherTalk });

    const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });

    expect(result.success && result.data).toEqual([
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
      const result = await listSpeakerProposals({ eventSlug: event.slug, userId: speaker.id });
      expect(result.success && result.data[0]).toContain({
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
