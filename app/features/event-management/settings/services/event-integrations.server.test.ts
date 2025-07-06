import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { eventIntegrationFactory } from 'tests/factories/integrations.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/shared/errors.server.ts';

import { EventIntegrations } from './event-integrations.server.ts';

describe('EventIntegrations', () => {
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

  describe('#getConfiguration', () => {
    it('gets an integration configuration', async () => {
      const otherEvent = await eventFactory({ team });
      await eventIntegrationFactory({ event: otherEvent });
      const existingIntegration = await eventIntegrationFactory({ event });

      const eventIntegrations = EventIntegrations.for(owner.id, team.slug, event.slug);

      const integration = await eventIntegrations.getConfiguration(existingIntegration.name);
      expect(integration).toEqual({
        id: existingIntegration.id,
        name: existingIntegration.name,
        configuration: existingIntegration.configuration,
      });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(
        EventIntegrations.for(user.id, team.slug, event.slug).getConfiguration('OPEN_PLANNER'),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#save', () => {
    it('adds a new integration', async () => {
      const eventIntegrations = EventIntegrations.for(owner.id, team.slug, event.slug);

      await eventIntegrations.save({
        name: 'OPEN_PLANNER',
        configuration: { eventId: 'eventId!', apiKey: 'apiKey!' },
      });

      const integration = await eventIntegrations.getConfiguration('OPEN_PLANNER');
      expect(integration?.name).toBe('OPEN_PLANNER');
      expect(integration?.configuration).toEqual({ eventId: 'eventId!', apiKey: 'apiKey!' });
    });

    it('updates an integration', async () => {
      const integrationToUpdate = await eventIntegrationFactory({ event });

      const eventIntegrations = EventIntegrations.for(owner.id, team.slug, event.slug);

      await eventIntegrations.save({
        id: integrationToUpdate.id,
        name: 'OPEN_PLANNER',
        configuration: { eventId: 'eventId!', apiKey: 'apiKey!' },
      });

      const integration = await eventIntegrations.getConfiguration('OPEN_PLANNER');
      expect(integration?.name).toBe('OPEN_PLANNER');
      expect(integration?.configuration).toEqual({ eventId: 'eventId!', apiKey: 'apiKey!' });
    });

    it('throws an error if user is not owner', async () => {
      const eventIntegrations = EventIntegrations.for(reviewer.id, team.slug, event.slug);
      await expect(
        eventIntegrations.save({
          name: 'OPEN_PLANNER',
          configuration: { eventId: 'eventId!', apiKey: 'apiKey!' },
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const eventIntegrations = EventIntegrations.for(user.id, team.slug, event.slug);
      await expect(
        eventIntegrations.save({
          name: 'OPEN_PLANNER',
          configuration: { eventId: 'eventId!', apiKey: 'apiKey!' },
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#delete', () => {
    it('deletes an integration', async () => {
      const integration = await eventIntegrationFactory({ event });
      const eventIntegrations = EventIntegrations.for(owner.id, team.slug, event.slug);
      await eventIntegrations.delete(integration.id);

      const result = await eventIntegrations.getConfiguration('OPEN_PLANNER');
      expect(result).toBe(null);
    });

    it('throws an error if user is not owner', async () => {
      const integration = await eventIntegrationFactory({ event });
      const eventIntegrations = EventIntegrations.for(reviewer.id, team.slug, event.slug);
      await expect(eventIntegrations.delete(integration.id)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const integration = await eventIntegrationFactory({ event });
      const eventIntegrations = EventIntegrations.for(user.id, team.slug, event.slug);
      await expect(eventIntegrations.delete(integration.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#getConfigurations', () => {
    it('gets all integration configurations for an event', async () => {
      const integrations = [
        await eventIntegrationFactory({ event }),
        await eventIntegrationFactory({ event, attributes: { name: 'OPEN_AI', configuration: { apiKey: '' } } }),
      ];

      const otherEvent = await eventFactory({ team });
      await eventIntegrationFactory({ event: otherEvent });

      const eventIntegrations = EventIntegrations.for(owner.id, team.slug, event.slug);
      const result = await eventIntegrations.getConfigurations();

      expect(result).toEqual(
        expect.arrayContaining(
          integrations.map((integration) => ({
            id: integration.id,
            name: integration.name,
            configuration: integration.configuration,
          })),
        ),
      );
    });

    it('returns an empty array when no integrations exist', async () => {
      const eventIntegrations = EventIntegrations.for(owner.id, team.slug, event.slug);
      const result = await eventIntegrations.getConfigurations();

      expect(result).toEqual([]);
    });

    it('throws an error if user is not owner', async () => {
      const eventIntegrations = EventIntegrations.for(reviewer.id, team.slug, event.slug);
      await expect(eventIntegrations.getConfigurations()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const eventIntegrations = EventIntegrations.for(user.id, team.slug, event.slug);
      await expect(eventIntegrations.getConfigurations()).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
