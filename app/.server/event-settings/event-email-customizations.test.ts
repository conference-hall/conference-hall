import type { Event, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventEmailCustomizationFactory } from 'tests/factories/event-email-customizations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventEmailCustomizations } from './event-email-customizations.ts';

describe('EventEmailCustomizations', () => {
  let user: User;
  let team: Team;
  let event: Event;
  let emailCustomizations: EventEmailCustomizations;

  beforeEach(async () => {
    user = await userFactory();
    team = await teamFactory({ owners: [user] });
    event = await eventFactory({ team });
    emailCustomizations = EventEmailCustomizations.for(user.id, team.slug, event.slug);
  });

  describe('list', () => {
    test('returns empty array when no customizations exist', async () => {
      const result = await emailCustomizations.list();
      expect(result).toEqual([]);
    });

    test('returns customizations for the event', async () => {
      await eventEmailCustomizationFactory({
        event,
        traits: ['proposal-submitted'],
        attributes: { subject: 'Custom Subject', content: 'Custom Content' },
      });

      const result = await emailCustomizations.list();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        template: 'proposal-submitted',
        locale: 'en',
        subject: 'Custom Subject',
        content: 'Custom Content',
      });
    });
  });

  describe('get', () => {
    test('returns null when customization does not exist', async () => {
      const result = await emailCustomizations.get('proposal-submitted', 'en');
      expect(result).toBeNull();
    });

    test('returns customization when it exists', async () => {
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['proposal-submitted'],
        attributes: { subject: 'Custom Subject' },
      });

      const result = await emailCustomizations.get('proposal-submitted', 'en');
      expect(result).toMatchObject({
        id: customization.id,
        template: 'proposal-submitted',
        locale: 'en',
        subject: 'Custom Subject',
      });
    });
  });

  describe('upsert', () => {
    test('creates new customization when it does not exist', async () => {
      const data = {
        subject: 'New Subject',
        content: 'New Content',
      };

      const result = await emailCustomizations.upsert('proposal-submitted', 'en', data);

      expect(result).toMatchObject({
        eventId: event.id,
        template: 'proposal-submitted',
        locale: 'en',
        ...data,
      });
    });

    test('updates existing customization when it exists', async () => {
      await eventEmailCustomizationFactory({
        event,
        traits: ['proposal-submitted'],
        attributes: { subject: 'Original Subject' },
      });

      const data = {
        subject: 'Updated Subject',
        content: 'Updated Content',
      };

      const result = await emailCustomizations.upsert('proposal-submitted', 'en', data);

      expect(result).toMatchObject({ template: 'proposal-submitted', locale: 'en', ...data });
    });
  });

  describe('delete', () => {
    test('deletes existing customization', async () => {
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['proposal-submitted'],
        attributes: { subject: 'Subject to Delete' },
      });

      await emailCustomizations.delete('proposal-submitted', 'en');

      const deleted = await db.eventEmailCustomization.findUnique({ where: { id: customization.id } });
      expect(deleted).toBeNull();
    });

    test('throws error when trying to delete non-existent customization', async () => {
      const otherEvent = await eventFactory({ team, creator: user });

      await eventEmailCustomizationFactory({
        event: otherEvent,
        traits: ['proposal-submitted'],
        attributes: { subject: 'Other Subject' },
      });

      await expect(emailCustomizations.delete('proposal-submitted', 'en')).rejects.toThrow();
    });
  });
});
