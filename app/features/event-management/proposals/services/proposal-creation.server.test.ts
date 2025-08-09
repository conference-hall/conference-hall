import { db } from 'prisma/db.server.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventCategoryFactory } from '~/../tests/factories/categories.ts';
import { eventFactory } from '~/../tests/factories/events.ts';
import { eventFormatFactory } from '~/../tests/factories/formats.ts';
import { teamFactory } from '~/../tests/factories/team.ts';
import { userFactory } from '~/../tests/factories/users.ts';
import type { TalkProposalCreationData } from './proposal-creation.schema.server.ts';
import { ProposalCreation } from './proposal-creation.server.ts';

describe('ProposalCreation', () => {
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

      const result = await ProposalCreation.for(organizer.id, team.slug, event.slug).create(proposalData);

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

      const result = await ProposalCreation.for(organizer.id, team.slug, event.slug).create(proposalData);

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
});
