import { db } from '@conference-hall/database';
import { eventSpeakerFactory } from '@conference-hall/database/tests/factories/event-speakers.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { UserNotFoundError } from '~/shared/errors.server.ts';
import { EventSpeakerForProposal } from './event-speaker-for-proposal.ts';

describe('EventSpeakerForProposal', () => {
  describe('#upsertForUser', () => {
    it('creates a new speaker if not exists', async () => {
      const event = await eventFactory();
      const user = await userFactory();

      const speaker = await EventSpeakerForProposal.for(event.id).upsertForUser(user);

      expect(speaker).toMatchObject({
        userId: user.id,
        eventId: event.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        bio: user.bio,
        references: user.references,
        company: user.company,
        location: user.location,
        socialLinks: user.socialLinks,
        locale: user.locale,
      });
    });

    it('updates an existing speaker', async () => {
      const event = await eventFactory();
      const user = await userFactory();
      await eventSpeakerFactory({ event, user });

      const updatedUser = { ...user, name: 'Updated Name', locale: 'fr' };
      const speaker = await EventSpeakerForProposal.for(event.id).upsertForUser(updatedUser);

      expect(speaker.name).toBe('Updated Name');
      expect(speaker.locale).toBe('fr');
    });
  });

  describe('#upsertForUsers', () => {
    it('creates or updates multiple speakers', async () => {
      const event = await eventFactory();
      const users = await Promise.all([userFactory(), userFactory()]);

      const speakers = await EventSpeakerForProposal.for(event.id).upsertForUsers(users);

      expect(speakers.length).toBe(2);
      expect(speakers[0].userId).toBe(users[0].id);
      expect(speakers[1].userId).toBe(users[1].id);
    });
  });

  describe('#addSpeakerToProposal', () => {
    it('adds a speaker to a proposal', async () => {
      const event = await eventFactory();
      const user = await userFactory();
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event, talk });
      const newSpeaker = await userFactory();

      await EventSpeakerForProposal.for(event.id).addSpeakerToProposal(proposal.id, newSpeaker.id);

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true },
      });
      expect(updatedProposal?.speakers.map((s) => s.userId)).toEqual(expect.arrayContaining([user.id, newSpeaker.id]));
    });

    it('throws an error if user not found', async () => {
      const event = await eventFactory();
      const user = await userFactory();
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event, talk });

      const eventSpeaker = EventSpeakerForProposal.for(event.id);
      await expect(eventSpeaker.addSpeakerToProposal(proposal.id, 'non-existent-user-id')).rejects.toThrowError(
        UserNotFoundError,
      );
    });
  });

  describe('#removeSpeakerFromProposal', () => {
    it('removes a speaker from a proposal', async () => {
      const event = await eventFactory();
      const user1 = await userFactory();
      const user2 = await userFactory();
      const talk = await talkFactory({ speakers: [user1, user2] });
      const proposal = await proposalFactory({ event, talk });

      await EventSpeakerForProposal.for(event.id).removeSpeakerFromProposal(proposal.id, user2.id);

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true },
      });
      expect(updatedProposal?.speakers.map((s) => s.userId)).toEqual([user1.id]);
    });
  });
});
