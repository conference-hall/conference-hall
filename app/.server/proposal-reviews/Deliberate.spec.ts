import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.server.ts';
import { ForbiddenOperationError } from '~/libs/errors.server.ts';

import { Deliberate } from './Deliberate.ts';

describe('Deliberate', () => {
  let owner: User, reviewer: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    reviewer = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });

  describe('#mark', () => {
    it('updates the proposal', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const reviews = Deliberate.for(owner.id, team.slug, event.slug);
      const result = await reviews.mark([proposal1.id, proposal2.id], 'ACCEPTED');

      expect(result).toBe(2);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('ACCEPTED');

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('ACCEPTED');
    });

    it('resets the publication status when deliberation status changed to ACCEPTED/REJECTED', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted-published'],
      });
      const proposal2 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['rejected-published'],
      });

      const deliberate = Deliberate.for(owner.id, team.slug, event.slug);
      const result = await deliberate.mark([proposal1.id, proposal2.id], 'ACCEPTED');

      expect(result).toBe(1);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('ACCEPTED');
      expect(updated1?.publicationStatus).toBe('PUBLISHED');

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('ACCEPTED');
      expect(updated2?.publicationStatus).toBe('NOT_PUBLISHED');
    });

    it('resets the publication & confirmation statuses when deliberation status changed to PENDING', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['confirmed'],
      });
      const proposal2 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['rejected-published'],
      });

      const deliberate = Deliberate.for(owner.id, team.slug, event.slug);
      const result = await deliberate.mark([proposal1.id, proposal2.id], 'PENDING');

      expect(result).toBe(2);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('PENDING');
      expect(updated1?.publicationStatus).toBe('NOT_PUBLISHED');
      expect(updated1?.confirmationStatus).toBe(null);

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('PENDING');
      expect(updated2?.publicationStatus).toBe('NOT_PUBLISHED');
      expect(updated2?.confirmationStatus).toBe(null);
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const deliberate = Deliberate.for(reviewer.id, team.slug, event.slug);
      await expect(deliberate.mark([], 'ACCEPTED')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const deliberate = Deliberate.for(user.id, team.slug, event.slug);
      await expect(deliberate.mark([], 'ACCEPTED')).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#markAll', () => {
    it('updates proposals from a search', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const reviews = Deliberate.for(owner.id, team.slug, event.slug);
      const result = await reviews.markAll({ status: 'pending' }, 'REJECTED');

      expect(result).toBe(1);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('ACCEPTED');

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('REJECTED');
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const deliberate = Deliberate.for(reviewer.id, team.slug, event.slug);
      await expect(deliberate.markAll({}, 'ACCEPTED')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const deliberate = Deliberate.for(user.id, team.slug, event.slug);
      await expect(deliberate.markAll({}, 'ACCEPTED')).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
