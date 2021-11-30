import { EventVisibility } from '@prisma/client';
import { addDays } from 'date-fns';
import { setupDatabase } from 'tests/db-helpers';
import { buildEvent } from '../../../tests/factories/events';
import { searchEvents } from './search.service';

describe('Search Events service', () => {
  setupDatabase();

  describe('#search', () => {
    it('returns incoming events sorted by cfp start date by default', async () => {
      const event1 = await buildEvent({ cfpStart: new Date() });
      const event2 = await buildEvent({ cfpStart: addDays(new Date(), 1) });

      const data = await searchEvents({});
      expect(data.events.length).toBe(2);
      expect(data.events.map((e) => e.id)).toEqual([event2.id, event1.id]);
    });

    it('returns only public events', async () => {
      const event = await buildEvent({ cfpStart: new Date() });
      await buildEvent({ cfpStart: new Date(), visibility: EventVisibility.PRIVATE });

      const data = await searchEvents({});
      expect(data.events.length).toBe(1);
      expect(data.events.map((e) => e.id)).toEqual([event.id]);
    });

    it('search by event name (insensitive)', async () => {
      const event = await buildEvent({ name: 'Devfest Nantes', cfpStart: new Date() });
      await buildEvent({ name: 'Devoxx France', cfpStart: new Date() });

      const data = await searchEvents({ terms: 'devfest' });
      expect(data.events.length).toBe(1);
      expect(data.events.map((e) => e.id)).toEqual([event.id]);
    });

    it('return event data', async () => {
      const event = await buildEvent({ name: 'Devfest Nantes', cfpStart: new Date() });

      const data = await searchEvents({});
      expect(data.events[0]).toEqual({
        id: event.id,
        name: event.name,
        type: event.type,
        address: event.address,
        cfpStart: event.cfpStart,
        cfpEnd: event.cfpEnd,
      });
    });
  });
});
