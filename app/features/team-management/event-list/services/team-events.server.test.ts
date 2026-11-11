import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
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

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const { events } = await TeamEvents.for(authorizedTeam).list('active');

      expect(events).toEqual([
        {
          name: event2.name,
          slug: event2.slug,
          type: event2.type,
          logoUrl: resolveStorageUrl(event2.logo),
          timezone: event2.timezone,
          cfpStart: event2.cfpStart,
          cfpEnd: event2.cfpEnd,
          cfpState: 'CLOSED',
          archived: false,
        },
        {
          name: event1.name,
          slug: event1.slug,
          type: event1.type,
          logoUrl: resolveStorageUrl(event1.logo),
          timezone: event1.timezone,
          cfpStart: event1.cfpStart,
          cfpEnd: event1.cfpEnd,
          cfpState: 'CLOSED',
          archived: false,
        },
      ]);
    });

    it('returns archived events of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
      const event = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup', 'archived'] });
      await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const { events } = await TeamEvents.for(authorizedTeam).list('archived');

      expect(events).toEqual([
        {
          name: event.name,
          slug: event.slug,
          type: event.type,
          logoUrl: resolveStorageUrl(event.logo),
          timezone: event.timezone,
          cfpStart: event.cfpStart,
          cfpEnd: event.cfpEnd,
          cfpState: 'CLOSED',
          archived: true,
        },
      ]);
    });

    it('returns all events of the team, active ones first', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const archived = await eventFactory({ team, traits: ['archived'] });
      const active1 = await eventFactory({ team });
      const active2 = await eventFactory({ team });

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const { events } = await TeamEvents.for(authorizedTeam).list('all');

      expect(events.map((event) => event.slug)).toEqual([active2.slug, active1.slug, archived.slug]);
    });

    it('returns events count by status', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      await eventFactory({ team, traits: ['archived'] });
      await eventFactory({ team });
      await eventFactory({ team });
      await eventFactory({ traits: ['archived'] });

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const { counts } = await TeamEvents.for(authorizedTeam).list('archived');

      expect(counts).toEqual({ active: 2, archived: 1, all: 3 });
    });
  });
});
