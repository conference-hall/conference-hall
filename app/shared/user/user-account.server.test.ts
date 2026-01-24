import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { db } from '../../../prisma/db.server.ts';
import { UserAccount } from './user-account.server.ts';

describe('UserAccount', () => {
  describe('get', () => {
    it('returns authenticated user with profile and teams', async () => {
      const user = await userFactory({ traits: ['clark-kent'] });
      const team = await teamFactory({ attributes: { name: 'My Team' }, owners: [user] });
      const event = await eventFactory({ team, attributes: { name: 'My Event' } });

      const result = await UserAccount.for(user.id).get();

      expect(result).toEqual({
        id: user.id,
        uid: user.uid,
        name: 'Clark Kent',
        email: 'superman@example.com',
        picture: user.picture,
        hasTeamAccess: true,
        notificationsUnreadCount: 0,
        teams: [
          {
            slug: team.slug,
            name: 'My Team',
            role: 'OWNER',
            events: [{ name: event.name, slug: event.slug, logoUrl: event.logoUrl, archived: false }],
          },
        ],
      });
      expect(result?.notificationsUnreadCount).toBe(0);
    });

    it('returns null when user does not exist', async () => {
      const result = await UserAccount.for('non-existent-id').get();

      expect(result).toBeNull();
    });

    it('returns hasTeamAccess false when user has no teams and no organizer key', async () => {
      const user = await userFactory();

      const result = await UserAccount.for(user.id).get();

      expect(result?.hasTeamAccess).toBe(false);
      expect(result?.teams).toEqual([]);
    });
  });

  describe('getAccounts', () => {
    it('returns linked accounts for the user', async () => {
      const user = await userFactory({ withPasswordAccount: true });

      const accounts = await UserAccount.for(user.id).getAccounts();

      expect(accounts).toEqual([{ providerId: 'credential', accountId: user.id }]);
    });

    it('returns empty array when user has no accounts', async () => {
      const user = await userFactory();

      const accounts = await UserAccount.for(user.id).getAccounts();

      expect(accounts).toEqual([]);
    });
  });

  describe('teams', () => {
    it("returns user's teams", async () => {
      const user = await userFactory();
      const team1 = await teamFactory({ attributes: { name: 'A' }, owners: [user] });
      const team2 = await teamFactory({ attributes: { name: 'B' }, members: [user] });
      const team3 = await teamFactory({ attributes: { name: 'C' }, reviewers: [user] });
      const event1 = await eventFactory({ team: team1, attributes: { name: 'A' } });
      const event2 = await eventFactory({ team: team1, attributes: { name: 'B', archived: true } });

      const teams = await UserAccount.for(user.id).teams();

      expect(teams).toEqual([
        {
          slug: team1.slug,
          name: 'A',
          role: 'OWNER',
          events: [
            { slug: event1.slug, name: event1.name, logoUrl: event1.logoUrl, archived: false },
            { slug: event2.slug, name: event2.name, logoUrl: event2.logoUrl, archived: true },
          ],
        },
        { slug: team2.slug, name: 'B', role: 'MEMBER', events: [] },
        { slug: team3.slug, name: 'C', role: 'REVIEWER', events: [] },
      ]);
    });
  });

  describe('changeLocale', () => {
    it('changes the locale for the user and event speakers', async () => {
      const event = await eventFactory();
      const user = await userFactory({ traits: ['clark-kent'] });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

      const updatedUser = await UserAccount.for(user.id).changeLocale('fr');
      const eventSpeakers = await db.eventSpeaker.findMany({ where: { userId: user.id, eventId: event.id } });

      expect(updatedUser.locale).toEqual('fr');
      expect(eventSpeakers[0].locale).toEqual('fr');
    });
  });

  describe('deleteAccount', () => {
    it('anonymizes user data and deletes from Firebase', async () => {
      const user = await userFactory({
        traits: ['clark-kent'],
        attributes: {
          name: 'John Doe',
          email: 'john@example.com',
          bio: 'My bio',
          picture: 'https://example.com/picture.jpg',
          company: 'Acme Inc',
          references: 'https://example.com',
          location: 'Paris',
          socialLinks: [{ type: 'twitter', url: 'https://twitter.com/johndoe' }],
        },
      });
      await teamFactory({ members: [user] });
      await talkFactory({ speakers: [user] });

      await UserAccount.for(user.id).deleteAccount();

      const deletedUser = await db.user.findUnique({ where: { id: user.id } });
      expect(deletedUser?.uid).toBeNull();
      expect(deletedUser?.name).toEqual('Deleted user');
      expect(deletedUser?.email).toEqual(`deleted-${user.id}@conference-hall.io`);
      expect(deletedUser?.bio).toBeNull();
      expect(deletedUser?.picture).toBeNull();
      expect(deletedUser?.company).toBeNull();
      expect(deletedUser?.references).toBeNull();
      expect(deletedUser?.location).toBeNull();
      expect(deletedUser?.socialLinks).toEqual([]);
      expect(deletedUser?.deletedAt).not.toBeNull();

      const teamMembers = await db.teamMember.findMany({ where: { memberId: user.id } });
      expect(teamMembers).toHaveLength(0);

      const userTalks = await db.user.findUnique({ where: { id: user.id }, include: { talks: true } });
      expect(userTalks?.talks).toHaveLength(0);

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'auth-account-deleted',
          to: ['john@example.com'],
          locale: 'en',
        }),
      );
    });

    it('deletes surveys and anonymizes event speakers', async () => {
      const user = await userFactory({ traits: ['clark-kent'] });
      const event = await eventFactory();
      const talk = await talkFactory({ speakers: [user] });
      const _proposal = await proposalFactory({ event, talk });

      await db.survey.create({
        data: {
          userId: user.id,
          eventId: event.id,
          answers: { question1: 'answer1' },
        },
      });

      await UserAccount.for(user.id).deleteAccount();

      const surveys = await db.survey.findMany({ where: { userId: user.id } });
      expect(surveys).toHaveLength(0);

      const eventSpeakers = await db.eventSpeaker.findMany({ where: { eventId: event.id } });
      expect(eventSpeakers).toHaveLength(1);
      expect(eventSpeakers[0].userId).toBeNull();
      expect(eventSpeakers[0].name).toEqual(user.name);
      expect(eventSpeakers[0].email).toEqual('deleted-user-account');
      expect(eventSpeakers[0].bio).toBeNull();
      expect(eventSpeakers[0].picture).toBeNull();
      expect(eventSpeakers[0].company).toBeNull();
      expect(eventSpeakers[0].references).toBeNull();
      expect(eventSpeakers[0].location).toBeNull();
      expect(eventSpeakers[0].socialLinks).toEqual([]);
    });

    it('preserves created talks and events', async () => {
      const user = await userFactory({ traits: ['clark-kent'] });
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team, creator: user });
      const talk = await talkFactory({ speakers: [user] });

      await UserAccount.for(user.id).deleteAccount();

      const createdEvent = await db.event.findUnique({ where: { id: event.id } });
      expect(createdEvent).not.toBeNull();
      expect(createdEvent?.creatorId).toEqual(user.id);

      const createdTalk = await db.talk.findUnique({ where: { id: talk.id } });
      expect(createdTalk).not.toBeNull();
      expect(createdTalk?.creatorId).toEqual(user.id);
    });

    it('does not send confirmation email if not requested', async () => {
      const user = await userFactory({ traits: ['clark-kent'] });

      await UserAccount.for(user.id).deleteAccount({ sendConfirmationEmail: false });

      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });
  });
});
