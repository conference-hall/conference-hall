import { db } from 'prisma/db.server.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventCategoryFactory } from '~/../tests/factories/categories.ts';
import { eventFactory } from '~/../tests/factories/events.ts';
import { eventFormatFactory } from '~/../tests/factories/formats.ts';
import { eventProposalTagFactory } from '~/../tests/factories/proposal-tags.ts';
import { proposalFactory } from '~/../tests/factories/proposals.ts';
import { talkFactory } from '~/../tests/factories/talks.ts';
import { teamFactory } from '~/../tests/factories/team.ts';
import { userFactory } from '~/../tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { TalkProposalCreationData } from './proposal-management.schema.server.ts';
import { ProposalManagement } from './proposal-management.server.ts';

describe('ProposalManagement', () => {
  describe('create', () => {
    it('creates a proposal', async () => {
      const organizer = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [organizer] });
      const event = await eventFactory({ team, attributes: { name: 'Test Event' } });
      const eventSpeaker = await eventSpeakerFactory({ event, user: speaker });

      const proposalData: TalkProposalCreationData = {
        title: 'Test Talk',
        abstract: 'This is a test talk abstract',
        speakers: [eventSpeaker.id],
        references: 'Test references',
        languages: ['en'],
        level: 'INTERMEDIATE',
      };

      const result = await ProposalManagement.for(organizer.id, team.slug, event.slug).create(proposalData);

      expect(result).toEqual({ id: expect.any(String) });

      const proposal = await db.proposal.findUnique({ where: { id: result.id }, include: { speakers: true } });
      expect(proposal).toBeDefined();
      expect(proposal?.title).toBe('Test Talk');
      expect(proposal?.abstract).toBe('This is a test talk abstract');
      expect(proposal?.level).toBe('INTERMEDIATE');
      expect(proposal?.eventId).toBe(event.id);
      expect(proposal?.talkId).toBeNull();
      expect(proposal?.speakers).toHaveLength(1);
      expect(proposal?.speakers[0].id).toBe(eventSpeaker.id);
    });

    it('creates proposal with formats and categories', async () => {
      const organizer = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [organizer] });
      const event = await eventFactory({ team });
      const eventSpeaker = await eventSpeakerFactory({ event, user: speaker });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const proposalData: TalkProposalCreationData = {
        title: 'Test Talk with Format',
        abstract: 'This is a test talk abstract',
        speakers: [eventSpeaker.id],
        languages: ['en'],
        level: 'ADVANCED',
        formats: [format.id],
        categories: [category.id],
      };

      const result = await ProposalManagement.for(organizer.id, team.slug, event.slug).create(proposalData);

      const proposal = await db.proposal.findUnique({
        where: { id: result.id },
        include: { formats: true, categories: true },
      });
      expect(proposal?.formats).toHaveLength(1);
      expect(proposal?.formats[0].id).toBe(format.id);
      expect(proposal?.categories).toHaveLength(1);
      expect(proposal?.categories[0].id).toBe(category.id);
    });
  });

  describe('update', () => {
    it('updates the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const updated = await ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id).update({
        title: 'Updated',
        abstract: 'Updated',
        level: 'ADVANCED',
        references: 'Updated',
        languages: [],
        formats: [format.id],
        categories: [category.id],
      });

      expect(updated.title).toBe('Updated');
      expect(updated.abstract).toBe('Updated');
      expect(updated.level).toBe('ADVANCED');
      expect(updated.references).toBe('Updated');

      const formatCount = await db.eventFormat.count({ where: { proposals: { some: { id: proposal.id } } } });
      expect(formatCount).toBe(1);

      const categoryCount = await db.eventCategory.count({ where: { proposals: { some: { id: proposal.id } } } });
      expect(categoryCount).toBe(1);
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await expect(
        ProposalManagement.for(speaker.id, team.slug, event.slug, proposal.id).update({
          title: 'Updated',
          abstract: 'Updated',
          level: null,
          references: null,
          languages: [],
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const user = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await expect(
        ProposalManagement.for(user.id, team.slug, event.slug, proposal.id).update({
          title: 'Updated',
          abstract: 'Updated',
          level: null,
          references: null,
          languages: [],
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('saveTags', () => {
    it('adds a new tags to the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const tag = await eventProposalTagFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveTags({ tags: [tag.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { tags: true },
      });
      expect(updatedProposal?.tags).toEqual([{ id: tag.id, name: tag.name, color: tag.color }]);
    });

    it('removes tags from the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const tag = await eventProposalTagFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), tags: [tag] });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveTags({ tags: [] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { tags: true },
      });
      expect(updatedProposal?.tags).toEqual([]);
    });

    it('changes tags of the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const tag = await eventProposalTagFactory({ event });
      const newTag = await eventProposalTagFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), tags: [tag] });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveTags({ tags: [newTag.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { tags: true },
      });
      expect(updatedProposal?.tags).toEqual([{ id: newTag.id, name: newTag.name, color: newTag.color }]);
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(speaker.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveTags({ tags: [] })).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const user = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(user.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveTags({ tags: [] })).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
