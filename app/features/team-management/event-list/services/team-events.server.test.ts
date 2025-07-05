import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { TeamEvents } from './team-events.server.ts';

describe('TeamEvents', () => {
  describe('list', () => {
    it('returns events of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event1 = await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });
      const event2 = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup'] });

      const team2 = await teamFactory({ owners: [user] });
      await eventFactory({ traits: ['conference-cfp-open'], team: team2 });

      const events = await TeamEvents.for(user.id, team.slug).list(false);

      expect(events).toEqual([
        {
          name: event2.name,
          slug: event2.slug,
          type: event2.type,
          logoUrl: event2.logoUrl,
          timezone: event2.timezone,
          cfpStart: event2.cfpStart,
          cfpEnd: event2.cfpEnd,
          cfpState: 'CLOSED',
        },
        {
          name: event1.name,
          slug: event1.slug,
          type: event1.type,
          logoUrl: event1.logoUrl,
          timezone: event1.timezone,
          cfpStart: event1.cfpStart,
          cfpEnd: event1.cfpEnd,
          cfpState: 'CLOSED',
        },
      ]);
    });

    it('returns archived events of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup', 'archived'] });
      await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });

      const events = await TeamEvents.for(user.id, team.slug).list(true);

      expect(events).toEqual([
        {
          name: event.name,
          slug: event.slug,
          type: event.type,
          logoUrl: event.logoUrl,
          timezone: event.timezone,
          cfpStart: event.cfpStart,
          cfpEnd: event.cfpEnd,
          cfpState: 'CLOSED',
        },
      ]);
    });

    it('throws an error when user not member of event team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ attributes: { slug: 'my-team' } });
      await eventFactory({ team });

      await expect(TeamEvents.for(user.id, team.slug).list(false)).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
