import { db } from 'prisma/db.server.ts';
import type { Event, EventCategory, EventFormat, Team, User } from 'prisma/generated/client.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';

import { EventTracksSettings } from './event-tracks-settings.server.ts';

describe('EventTracksSettings', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });

  describe('#saveFormat', () => {
    it('adds a new format', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await EventTracksSettings.for(authorizedEvent).saveFormat({
        name: 'Format 1',
        description: 'Format 1',
      });

      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });

      expect(updated?.formats.length).toBe(1);
      expect(updated?.formats[0].name).toBe('Format 1');
      expect(updated?.formats[0].description).toBe('Format 1');
    });

    it('adds a new format with correct order at the end', async () => {
      await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
      await eventFormatFactory({ event, attributes: { name: 'Format 2' } });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await EventTracksSettings.for(authorizedEvent).saveFormat({
        name: 'Format 3',
        description: 'New format',
      });

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { formats: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.formats.length).toBe(3);
      expect(updated?.formats[0].name).toBe('Format 1');
      expect(updated?.formats[0].order).toBe(0);
      expect(updated?.formats[1].name).toBe('Format 2');
      expect(updated?.formats[1].order).toBe(1);
      expect(updated?.formats[2].name).toBe('Format 3');
      expect(updated?.formats[2].order).toBe(2);
    });

    it('updates an event format', async () => {
      const format = await eventFormatFactory({ event, attributes: { name: 'name', description: 'desc' } });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await EventTracksSettings.for(authorizedEvent).saveFormat({
        id: format.id,
        name: 'Format 1',
        description: 'Format 1',
      });

      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });

      expect(updated?.formats.length).toBe(1);
      expect(updated?.formats[0].name).toBe('Format 1');
      expect(updated?.formats[0].description).toBe('Format 1');
    });

    it('throws an error if user is not owner', async () => {
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        await EventTracksSettings.for(authorizedEvent).saveFormat({
          name: 'Hello world',
          description: 'Hello world',
        });
      }).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        await EventTracksSettings.for(authorizedEvent).saveFormat({
          name: 'Hello world',
          description: 'Hello world',
        });
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#saveCategory', () => {
    it('adds a new category', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await EventTracksSettings.for(authorizedEvent).saveCategory({
        name: 'Category 1',
        description: 'Category 1',
      });

      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });

      expect(updated?.categories.length).toBe(1);
      expect(updated?.categories[0].name).toBe('Category 1');
      expect(updated?.categories[0].description).toBe('Category 1');
    });

    it('updates an event category', async () => {
      const category = await eventCategoryFactory({ event, attributes: { name: 'name', description: 'desc' } });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await EventTracksSettings.for(authorizedEvent).saveCategory({
        id: category.id,
        name: 'Category 1',
        description: 'Category 1',
      });

      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });

      expect(updated?.categories.length).toBe(1);
      expect(updated?.categories[0].name).toBe('Category 1');
      expect(updated?.categories[0].description).toBe('Category 1');
    });

    it('throws an error if user is not owner', async () => {
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.saveCategory({ name: 'Hello world', description: 'Hello world' });
      }).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.saveCategory({ name: 'Hello world', description: 'Hello world' });
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#deleteFormat', () => {
    let format: EventFormat;

    beforeEach(async () => {
      format = await eventFormatFactory({ event });
    });

    it('deletes an event format', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.deleteFormat(format.id);
      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });
      expect(updated?.formats.length).toBe(0);
    });

    it('reorders remaining formats after deletion', async () => {
      const format2 = await eventFormatFactory({ event });
      const format3 = await eventFormatFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.deleteFormat(format2.id);

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { formats: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.formats.length).toBe(2);
      expect(updated?.formats[0].id).toBe(format.id);
      expect(updated?.formats[0].order).toBe(0);
      expect(updated?.formats[1].id).toBe(format3.id);
      expect(updated?.formats[1].order).toBe(1);
    });

    it('throws an error if user is not owner', async () => {
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.deleteFormat(format.id);
      }).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.deleteFormat(format.id);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#deleteCategory', () => {
    let category: EventCategory;

    beforeEach(async () => {
      category = await eventCategoryFactory({ event });
    });

    it('deletes an event category', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.deleteCategory(category.id);
      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });
      expect(updated?.categories.length).toBe(0);
    });

    it('reorders remaining categories after deletion', async () => {
      const category2 = await eventCategoryFactory({ event });
      const category3 = await eventCategoryFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.deleteCategory(category2.id);

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { categories: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.categories.length).toBe(2);
      expect(updated?.categories[0].id).toBe(category.id);
      expect(updated?.categories[0].order).toBe(0);
      expect(updated?.categories[1].id).toBe(category3.id);
      expect(updated?.categories[1].order).toBe(1);
    });

    it('throws an error if user is not owner', async () => {
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.deleteCategory(category.id);
      }).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.deleteCategory(category.id);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#reorderFormat', () => {
    it('moves format up in the list', async () => {
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });
      const format3 = await eventFormatFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderFormat(format2.id, 'up');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { formats: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.formats[0].id).toBe(format2.id);
      expect(updated?.formats[0].order).toBe(0);
      expect(updated?.formats[1].id).toBe(format1.id);
      expect(updated?.formats[1].order).toBe(1);
      expect(updated?.formats[2].id).toBe(format3.id);
      expect(updated?.formats[2].order).toBe(2);
    });

    it('moves format down in the list', async () => {
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });
      const format3 = await eventFormatFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderFormat(format2.id, 'down');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { formats: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.formats[0].id).toBe(format1.id);
      expect(updated?.formats[0].order).toBe(0);
      expect(updated?.formats[1].id).toBe(format3.id);
      expect(updated?.formats[1].order).toBe(1);
      expect(updated?.formats[2].id).toBe(format2.id);
      expect(updated?.formats[2].order).toBe(2);
    });

    it('does not reorder if format is already at the top and moving up', async () => {
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderFormat(format1.id, 'up');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { formats: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.formats[0].id).toBe(format1.id);
      expect(updated?.formats[0].order).toBe(0);
      expect(updated?.formats[1].id).toBe(format2.id);
      expect(updated?.formats[1].order).toBe(1);
    });

    it('does not reorder if format is already at the bottom and moving down', async () => {
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderFormat(format2.id, 'down');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { formats: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.formats[0].id).toBe(format1.id);
      expect(updated?.formats[0].order).toBe(0);
      expect(updated?.formats[1].id).toBe(format2.id);
      expect(updated?.formats[1].order).toBe(1);
    });

    it('throws an error if user is not owner', async () => {
      const format = await eventFormatFactory({ event });
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.reorderFormat(format.id, 'up');
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#reorderCategory', () => {
    it('moves category up in the list', async () => {
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });
      const category3 = await eventCategoryFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderCategory(category2.id, 'up');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { categories: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.categories[0].id).toBe(category2.id);
      expect(updated?.categories[0].order).toBe(0);
      expect(updated?.categories[1].id).toBe(category1.id);
      expect(updated?.categories[1].order).toBe(1);
      expect(updated?.categories[2].id).toBe(category3.id);
      expect(updated?.categories[2].order).toBe(2);
    });

    it('moves category down in the list', async () => {
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });
      const category3 = await eventCategoryFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderCategory(category2.id, 'down');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { categories: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.categories[0].id).toBe(category1.id);
      expect(updated?.categories[0].order).toBe(0);
      expect(updated?.categories[1].id).toBe(category3.id);
      expect(updated?.categories[1].order).toBe(1);
      expect(updated?.categories[2].id).toBe(category2.id);
      expect(updated?.categories[2].order).toBe(2);
    });

    it('does not reorder if category is already at the top and moving up', async () => {
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderCategory(category1.id, 'up');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { categories: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.categories[0].id).toBe(category1.id);
      expect(updated?.categories[0].order).toBe(0);
      expect(updated?.categories[1].id).toBe(category2.id);
      expect(updated?.categories[1].order).toBe(1);
    });

    it('does not reorder if category is already at the bottom and moving down', async () => {
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const settings = EventTracksSettings.for(authorizedEvent);
      await settings.reorderCategory(category2.id, 'down');

      const updated = await db.event.findUnique({
        where: { slug: event.slug },
        include: { categories: { orderBy: { order: 'asc' } } },
      });

      expect(updated?.categories[0].id).toBe(category1.id);
      expect(updated?.categories[0].order).toBe(0);
      expect(updated?.categories[1].id).toBe(category2.id);
      expect(updated?.categories[1].order).toBe(1);
    });

    it('throws an error if user is not owner', async () => {
      const category = await eventCategoryFactory({ event });
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const settings = EventTracksSettings.for(authorizedEvent);
        await settings.reorderCategory(category.id, 'up');
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
