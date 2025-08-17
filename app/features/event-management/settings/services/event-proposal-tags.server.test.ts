import type { Event, EventProposalTag, Team, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { EventProposalTags } from './event-proposal-tags.server.ts';

describe('EventProposalTags', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });

    const otherEvent = await eventFactory({ team });
    await eventProposalTagFactory({ event: otherEvent });
  });

  describe('#list', () => {
    it('returns all event tags', async () => {
      const tag1 = await eventProposalTagFactory({ event, attributes: { name: 'Foo' } });
      const tag2 = await eventProposalTagFactory({ event, attributes: { name: 'Bar' } });

      const eventProposalTag = EventProposalTags.for(owner.id, team.slug, event.slug);
      await eventProposalTag.list({});

      const { count, tags, pagination } = await eventProposalTag.list({});

      expect(count).toBe(2);
      expect(tags.length).toBe(2);
      expect(tags[0].name).toBe(tag2.name);
      expect(tags[1].name).toBe(tag1.name);
      expect(pagination).toEqual({ current: 1, total: 1 });
    });

    it('filters event tags', async () => {
      const tag1 = await eventProposalTagFactory({ event, attributes: { name: 'Foo' } });
      await eventProposalTagFactory({ event, attributes: { name: 'Bar' } });

      const eventProposalTag = EventProposalTags.for(owner.id, team.slug, event.slug);
      await eventProposalTag.list({});

      const { count, tags, pagination } = await eventProposalTag.list({ query: 'fo' });

      expect(count).toBe(1);
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe(tag1.name);
      expect(pagination).toEqual({ current: 1, total: 1 });
    });

    it('paginates event tags', async () => {
      const tag1 = await eventProposalTagFactory({ event, attributes: { name: 'Foo' } });
      await eventProposalTagFactory({ event, attributes: { name: 'Bar' } });

      const eventProposalTag = EventProposalTags.for(owner.id, team.slug, event.slug);
      await eventProposalTag.list({});

      const { count, tags, pagination } = await eventProposalTag.list({}, 2, 1);

      expect(count).toBe(2);
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe(tag1.name);
      expect(pagination).toEqual({ current: 2, total: 2 });
    });

    it('throws an error if user is not owner', async () => {
      const eventProposalTag = EventProposalTags.for(reviewer.id, team.slug, event.slug);
      await expect(eventProposalTag.list({})).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const eventProposalTag = EventProposalTags.for(user.id, team.slug, event.slug);
      await expect(eventProposalTag.list({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#save', () => {
    it('adds a new tag for the event', async () => {
      const eventProposalTag = EventProposalTags.for(owner.id, team.slug, event.slug);
      await eventProposalTag.save({ name: 'Tag 1', color: '#000000' });

      const { tags } = await eventProposalTag.list({});

      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('Tag 1');
      expect(tags[0].color).toBe('#000000');
    });

    it('updates an event tag', async () => {
      const tag = await eventProposalTagFactory({ event });

      const eventProposalTag = EventProposalTags.for(owner.id, team.slug, event.slug);
      await eventProposalTag.save({ id: tag.id, name: 'Tag 1', color: '#000000' });

      const { tags } = await eventProposalTag.list({});

      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('Tag 1');
      expect(tags[0].color).toBe('#000000');
    });

    it('throws an error if user is not owner', async () => {
      const eventProposalTag = EventProposalTags.for(reviewer.id, team.slug, event.slug);
      await expect(eventProposalTag.save({ name: 'X', color: 'X' })).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const eventProposalTag = EventProposalTags.for(user.id, team.slug, event.slug);
      await expect(eventProposalTag.save({ name: 'X', color: 'X' })).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#delete', () => {
    let tag: EventProposalTag;

    beforeEach(async () => {
      tag = await eventProposalTagFactory({ event });
    });

    it('deletes an event tag', async () => {
      const eventProposalTag = EventProposalTags.for(owner.id, team.slug, event.slug);
      await eventProposalTag.delete(tag.id);
      const { tags } = await eventProposalTag.list({});
      expect(tags.length).toBe(0);
    });

    it('throws an error if user is not owner', async () => {
      const eventProposalTag = EventProposalTags.for(reviewer.id, team.slug, event.slug);
      await expect(eventProposalTag.delete(tag.id)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const eventProposalTag = EventProposalTags.for(user.id, team.slug, event.slug);
      await expect(eventProposalTag.delete(tag.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
