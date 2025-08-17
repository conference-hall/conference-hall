import { db } from 'prisma/db.server.ts';
import type { Event, Team, User } from 'prisma/generated/client.ts';
import { eventEmailCustomizationFactory } from 'tests/factories/event-email-customizations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventEmailCustomizations } from './event-email-customizations.server.tsx';

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
        traits: ['speakers-proposal-submitted'],
        attributes: { subject: 'Custom Subject', content: 'Custom Content' },
      });

      const result = await emailCustomizations.list();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        template: 'speakers-proposal-submitted',
        locale: 'en',
        subject: 'Custom Subject',
        content: 'Custom Content',
      });
    });
  });

  describe('getForPreview', () => {
    test('returns null customization when  does not exist', async () => {
      const result = await emailCustomizations.getForPreview('speakers-proposal-submitted', 'en');
      expect(result).toMatchObject({
        template: 'speakers-proposal-submitted',
        customization: null,
        defaults: { subject: expect.any(String), from: expect.any(String) },
        preview: expect.any(String),
      });
    });

    test('returns customization when it exists', async () => {
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted'],
        attributes: { subject: 'Custom Subject' },
      });

      const result = await emailCustomizations.getForPreview('speakers-proposal-submitted', 'en');
      expect(result).toMatchObject({
        template: 'speakers-proposal-submitted',
        customization,
        defaults: { subject: expect.any(String), from: expect.any(String) },
        preview: expect.any(String),
      });
    });
  });

  describe('save', () => {
    test('creates new customization when it does not exist', async () => {
      const data = {
        template: 'speakers-proposal-submitted',
        locale: 'en',
        subject: 'New Subject',
        content: 'New Content',
      } as const;

      const result = await emailCustomizations.save(data);

      expect(result).toMatchObject({
        eventId: event.id,
        ...data,
      });
    });

    test('updates existing customization when it exists', async () => {
      await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted'],
        attributes: { subject: 'Original Subject' },
      });

      const data = {
        template: 'speakers-proposal-submitted',
        locale: 'en',
        subject: 'Updated Subject',
        content: 'Updated Content',
      } as const;

      const result = await emailCustomizations.save(data);

      expect(result).toMatchObject(data);
    });

    test('resets customization when both subject and content are empty', async () => {
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted'],
        attributes: { subject: 'Subject to Delete', content: 'Content to Delete' },
      });

      const data = {
        template: 'speakers-proposal-submitted',
        locale: 'en',
        subject: '',
        content: '',
      } as const;

      await emailCustomizations.save(data);

      const deleted = await db.eventEmailCustomization.findUnique({ where: { id: customization.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('reset', () => {
    test('deletes existing customization', async () => {
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted'],
        attributes: { subject: 'Subject to Delete' },
      });

      await emailCustomizations.reset({ template: 'speakers-proposal-submitted', locale: 'en' });

      const deleted = await db.eventEmailCustomization.findUnique({ where: { id: customization.id } });
      expect(deleted).toBeNull();
    });
  });
});
