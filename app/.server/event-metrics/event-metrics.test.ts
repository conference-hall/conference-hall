import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { EventMetrics } from './event-metrics.ts';

describe('EventMetrics', () => {
  let owner: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let event2: Event;
  let format: EventFormat;
  let format2: EventFormat;
  let category: EventCategory;
  let category2: EventCategory;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));

    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    format2 = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    category2 = await eventCategoryFactory({ event });
    event2 = await eventFactory();

    const talk1 = await talkFactory({ speakers: [speaker] });
    const talk2 = await talkFactory({ speakers: [owner] });
    const talk3 = await talkFactory({ speakers: [speaker, owner] });
    const talk4 = await talkFactory({ speakers: [speaker, owner] });
    await proposalFactory({ event, talk: talk3, traits: ['draft'] });

    const proposal1 = await proposalFactory({
      event,
      talk: talk1,
      formats: [format, format2],
      categories: [category2],
    });
    await reviewFactory({ user: speaker, proposal: proposal1 });
    await reviewFactory({ user: owner, proposal: proposal1 });

    vi.setSystemTime(new Date('2020-03-26T00:00:00.000Z'));

    const proposal2 = await proposalFactory({ event, talk: talk2, formats: [format], categories: [category] });
    await reviewFactory({ user: owner, proposal: proposal2 });

    const proposal3 = await proposalFactory({ event: event2, talk: talk4 });
    await reviewFactory({ user: owner, proposal: proposal3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#get', () => {
    it('returns metrics for an event with proposals', async () => {
      const metrics = await EventMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics.proposalsCount).toBe(2);
      expect(metrics.speakersCount).toBe(2);
      expect(metrics.reviewsCount).toBe(2);
      expect(metrics.byFormats).toEqual(
        expect.arrayContaining([
          { id: format.id, name: format.name, value: 2, to: `reviews?formats=${format.id}` },
          { id: format2.id, name: format2.name, value: 1, to: `reviews?formats=${format2.id}` },
        ]),
      );
      expect(metrics.byCategories).toEqual(
        expect.arrayContaining([
          { id: category.id, name: category.name, value: 1, to: `reviews?categories=${category.id}` },
          { id: category2.id, name: category2.name, value: 1, to: `reviews?categories=${category2.id}` },
        ]),
      );
      expect(metrics.byDays).toEqual(
        expect.arrayContaining([
          { date: new Date('2020-02-26T00:00:00.000Z'), count: 1, cumulative: 1 },
          { date: new Date('2020-03-26T00:00:00.000Z'), count: 1, cumulative: 2 },
        ]),
      );
    });

    it('returns metrics for an event without proposals and without tracks', async () => {
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });

      const metrics = await EventMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics.proposalsCount).toBe(0);
      expect(metrics.speakersCount).toBe(0);
      expect(metrics.reviewsCount).toBe(0);
      expect(metrics.byCategories).toBe(null);
      expect(metrics.byFormats).toBe(null);
      expect(metrics.byDays).toEqual([]);
    });

    it('returns metrics for an event with proposals but without tracks', async () => {
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const talk = await talkFactory({ speakers: [owner] });
      await proposalFactory({ event, talk });

      const metrics = await EventMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics.proposalsCount).toBe(1);
      expect(metrics.speakersCount).toBe(1);
      expect(metrics.reviewsCount).toBe(0);
      expect(metrics.byCategories).toBe(null);
      expect(metrics.byFormats).toBe(null);
      expect(metrics.byDays.length).toBe(1);
    });

    it('throws an error if the user does not have permission to access the event', async () => {
      await expect(EventMetrics.for(owner.id, team.slug, event2.slug).get()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
