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
import type { ProposalCreationData } from './proposal-management.schema.server.ts';
import { ProposalManagement } from './proposal-management.server.ts';

describe('ProposalManagement', () => {
  describe('create', () => {
    it('creates a proposal', async () => {
      const organizer = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [organizer] });
      const event = await eventFactory({ team, attributes: { name: 'Test Event' } });
      const eventSpeaker = await eventSpeakerFactory({ event, user: speaker });

      const proposalData: ProposalCreationData = {
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
      expect(proposal?.proposalNumber).toBe(1);
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

      const proposalData: ProposalCreationData = {
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
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const updated = await ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id).update({
        title: 'Updated',
        abstract: 'Updated',
        level: 'ADVANCED',
        references: 'Updated',
        languages: [],
      });

      expect(updated.title).toBe('Updated');
      expect(updated.abstract).toBe('Updated');
      expect(updated.level).toBe('ADVANCED');
      expect(updated.references).toBe('Updated');
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
      expect(updatedProposal?.tags).toHaveLength(1);
      expect(updatedProposal?.tags[0]).toMatchObject({ id: tag.id, name: tag.name, color: tag.color });
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
      expect(updatedProposal?.tags).toHaveLength(1);
      expect(updatedProposal?.tags[0]).toMatchObject({ id: newTag.id, name: newTag.name, color: newTag.color });
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

  describe('saveSpeakers', () => {
    it('adds new speakers to the proposal', async () => {
      const owner = await userFactory();
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const eventSpeaker1 = await eventSpeakerFactory({ event, user: speaker1 });
      const eventSpeaker2 = await eventSpeakerFactory({ event, user: speaker2 });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveSpeakers({ speakers: [eventSpeaker1.id, eventSpeaker2.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true },
      });
      expect(updatedProposal?.speakers).toHaveLength(2);
      expect(updatedProposal?.speakers.map((s) => s.id)).toEqual(
        expect.arrayContaining([eventSpeaker1.id, eventSpeaker2.id]),
      );
    });

    it('removes speakers from the proposal', async () => {
      const owner = await userFactory();
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const eventSpeaker1 = await eventSpeakerFactory({ event, user: speaker1 });
      await eventSpeakerFactory({ event, user: speaker2 });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveSpeakers({ speakers: [eventSpeaker1.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true },
      });
      expect(updatedProposal?.speakers).toHaveLength(1);
      expect(updatedProposal?.speakers[0].id).toBe(eventSpeaker1.id);
    });

    it('changes speakers of the proposal', async () => {
      const owner = await userFactory();
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      await eventSpeakerFactory({ event, user: speaker1 });
      const eventSpeaker2 = await eventSpeakerFactory({ event, user: speaker2 });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1] }),
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveSpeakers({ speakers: [eventSpeaker2.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true },
      });
      expect(updatedProposal?.speakers).toHaveLength(1);
      expect(updatedProposal?.speakers[0].id).toBe(eventSpeaker2.id);
    });

    it('throws an error when speaker does not belong to the event', async () => {
      const owner = await userFactory();
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const otherEvent = await eventFactory({ team });
      await eventSpeakerFactory({ event, user: speaker1 });
      const eventSpeaker2 = await eventSpeakerFactory({ event: otherEvent, user: speaker2 });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1] }),
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);

      await expect(proposalManagement.saveSpeakers({ speakers: [eventSpeaker2.id] })).rejects.toThrow(
        `Speakers with IDs ${eventSpeaker2.id} do not belong to this event`,
      );
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(speaker.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveSpeakers({ speakers: [] })).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const user = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(user.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveSpeakers({ speakers: [] })).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('saveFormats', () => {
    it('adds new formats to the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveFormats({ formats: [format1.id, format2.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true },
      });
      expect(updatedProposal?.formats).toHaveLength(2);
      expect(updatedProposal?.formats.map((f) => f.id)).toEqual(expect.arrayContaining([format1.id, format2.id]));
    });

    it('removes formats from the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        formats: [format1, format2],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveFormats({ formats: [format1.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true },
      });
      expect(updatedProposal?.formats).toHaveLength(1);
      expect(updatedProposal?.formats[0].id).toBe(format1.id);
    });

    it('changes formats of the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        formats: [format1],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveFormats({ formats: [format2.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true },
      });
      expect(updatedProposal?.formats).toHaveLength(1);
      expect(updatedProposal?.formats[0].id).toBe(format2.id);
    });

    it('clears all formats from the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const format = await eventFormatFactory({ event });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        formats: [format],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveFormats({ formats: [] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true },
      });
      expect(updatedProposal?.formats).toEqual([]);
    });

    it('throws an error when format does not belong to the event', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const otherEvent = await eventFactory({ team });
      const format1 = await eventFormatFactory({ event });
      const format2 = await eventFormatFactory({ event: otherEvent });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        formats: [format1],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);

      await expect(proposalManagement.saveFormats({ formats: [format2.id] })).rejects.toThrow(
        `Formats with IDs ${format2.id} do not belong to this event`,
      );
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(speaker.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveFormats({ formats: [] })).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const user = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(user.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveFormats({ formats: [] })).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('saveCategories', () => {
    it('adds new categories to the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveCategories({ categories: [category1.id, category2.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { categories: true },
      });
      expect(updatedProposal?.categories).toHaveLength(2);
      expect(updatedProposal?.categories.map((c) => c.id)).toEqual(
        expect.arrayContaining([category1.id, category2.id]),
      );
    });

    it('removes categories from the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        categories: [category1, category2],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveCategories({ categories: [category1.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { categories: true },
      });
      expect(updatedProposal?.categories).toHaveLength(1);
      expect(updatedProposal?.categories[0].id).toBe(category1.id);
    });

    it('changes categories of the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        categories: [category1],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveCategories({ categories: [category2.id] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { categories: true },
      });
      expect(updatedProposal?.categories).toHaveLength(1);
      expect(updatedProposal?.categories[0].id).toBe(category2.id);
    });

    it('clears all categories from the proposal', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const category = await eventCategoryFactory({ event });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        categories: [category],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);
      await proposalManagement.saveCategories({ categories: [] });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { categories: true },
      });
      expect(updatedProposal?.categories).toEqual([]);
    });

    it('throws an error when category does not belong to the event', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const otherEvent = await eventFactory({ team });
      const category1 = await eventCategoryFactory({ event });
      const category2 = await eventCategoryFactory({ event: otherEvent });
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        categories: [category1],
      });

      const proposalManagement = ProposalManagement.for(owner.id, team.slug, event.slug, proposal.id);

      await expect(proposalManagement.saveCategories({ categories: [category2.id] })).rejects.toThrow(
        `Categories with IDs ${category2.id} do not belong to this event`,
      );
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(speaker.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveCategories({ categories: [] })).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const owner = await userFactory();
      const speaker = await userFactory();
      const user = await userFactory();
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposalManagement = ProposalManagement.for(user.id, team.slug, event.slug, proposal.id);
      await expect(proposalManagement.saveCategories({ categories: [] })).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
