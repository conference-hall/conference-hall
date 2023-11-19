import type { User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { config } from '~/libs/config.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

import { MyTeam } from './MyTeam';

describe('MyTeam', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('allowedFor', () => {
    it('returns the member info if allowed for the team', async () => {
      const team = await teamFactory({ owners: [user] });

      const member = await MyTeam.for(user.id, team.slug).allowedFor(['OWNER']);

      expect(member.memberId).toEqual(user.id);
      expect(member.teamId).toEqual(team.id);
      expect(member.role).toEqual('OWNER');
    });

    it('throws an error if user role is not in the accepted role list', async () => {
      const team = await teamFactory({ members: [user] });
      await expect(MyTeam.for(user.id, team.slug).allowedFor(['OWNER'])).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user has access to another team but not the given one', async () => {
      const team = await teamFactory();
      await teamFactory({ owners: [user] });
      await expect(MyTeam.for(user.id, team.slug).allowedFor(['OWNER'])).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if team does not exist', async () => {
      await teamFactory({ owners: [user] });
      await expect(MyTeam.for(user.id, 'XXX').allowedFor(['OWNER'])).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('get', () => {
    it('returns team belonging to user', async () => {
      await teamFactory({ owners: [user], attributes: { name: 'My team 1', slug: 'my-team1' } });
      const team = await teamFactory({ members: [user], attributes: { name: 'My team 2', slug: 'my-team2' } });

      const myTeam = await MyTeam.for(user.id, team.slug).get();

      expect(myTeam).toEqual({
        id: team.id,
        name: 'My team 2',
        slug: 'my-team2',
        role: 'MEMBER',
        invitationLink: `${config.appUrl}/invite/team/${team.invitationCode}`,
      });
    });

    it('throws an error when user is not member of the team', async () => {
      const team = await teamFactory({ attributes: { name: 'My team', slug: 'my-team' } });
      await expect(MyTeam.for(user.id, team.slug).get()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error when team not found', async () => {
      await expect(MyTeam.for(user.id, 'XXX').get()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('listEvents', () => {
    it('returns events of the team', async () => {
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event1 = await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });
      const event2 = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup'] });

      const team2 = await teamFactory({ owners: [user] });
      await eventFactory({ traits: ['conference-cfp-open'], team: team2 });

      const events = await MyTeam.for(user.id, team.slug).listEvents(false);

      expect(events).toEqual([
        {
          name: event1.name,
          slug: event1.slug,
          type: event1.type,
          logo: event1.logo,
          cfpStart: event1.cfpStart?.toUTCString(),
          cfpEnd: event1.cfpEnd?.toUTCString(),
          cfpState: 'CLOSED',
        },
        {
          name: event2.name,
          slug: event2.slug,
          type: event2.type,
          logo: event2.logo,
          cfpStart: event2.cfpStart?.toUTCString(),
          cfpEnd: event2.cfpEnd?.toUTCString(),
          cfpState: 'CLOSED',
        },
      ]);
    });

    it('returns archived events of the team', async () => {
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup', 'archived'] });
      await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });

      const events = await MyTeam.for(user.id, team.slug).listEvents(true);

      expect(events).toEqual([
        {
          name: event.name,
          slug: event.slug,
          type: event.type,
          logo: event.logo,
          cfpStart: event.cfpStart?.toUTCString(),
          cfpEnd: event.cfpEnd?.toUTCString(),
          cfpState: 'CLOSED',
        },
      ]);
    });

    it('throws an error when user not member of event team', async () => {
      const team = await teamFactory({ attributes: { slug: 'my-team' } });
      await eventFactory({ team });

      await expect(MyTeam.for(user.id, team.slug).listEvents(false)).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
