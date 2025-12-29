import { db } from 'prisma/db.server.ts';
import type { Event, Team, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { ProposalStatusUpdater } from './proposal-status-updater.server.ts';

describe('ProposalStatusUpdater', () => {
  let owner: User;
  let reviewer: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    reviewer = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });

  describe('#update', () => {
    it('updates the proposal deliberation status', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal1.id, proposal2.id], { deliberationStatus: 'ACCEPTED' });

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

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const deliberate = ProposalStatusUpdater.for(authorizedEvent);
      const result = await deliberate.update([proposal1.id, proposal2.id], { deliberationStatus: 'ACCEPTED' });

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

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const deliberate = ProposalStatusUpdater.for(authorizedEvent);
      const result = await deliberate.update([proposal1.id, proposal2.id], { deliberationStatus: 'PENDING' });

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
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const deliberate = ProposalStatusUpdater.for(authorizedEvent);
      await expect(deliberate.update([], { deliberationStatus: 'ACCEPTED' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const deliberate = ProposalStatusUpdater.for(authorizedEvent);
        await deliberate.update([], { deliberationStatus: 'ACCEPTED' });
      }).rejects.toThrowError(ForbiddenOperationError);
    });

    it('updates the proposal confirmation status', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });
      const proposal2 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal1.id, proposal2.id], { confirmationStatus: 'CONFIRMED' });

      expect(result).toBe(2);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('ACCEPTED');
      expect(updated1?.publicationStatus).toBe('PUBLISHED');
      expect(updated1?.confirmationStatus).toBe('CONFIRMED');

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('ACCEPTED');
      expect(updated2?.publicationStatus).toBe('PUBLISHED');
      expect(updated2?.confirmationStatus).toBe('CONFIRMED');
    });

    it('updates proposal confirmation status to DECLINED', async () => {
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal.id], { confirmationStatus: 'DECLINED' });

      expect(result).toBe(1);
      const updated = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(updated?.deliberationStatus).toBe('ACCEPTED');
      expect(updated?.publicationStatus).toBe('PUBLISHED');
      expect(updated?.confirmationStatus).toBe('DECLINED');
    });

    it('updates proposal confirmation status to PENDING', async () => {
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['confirmed'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal.id], { confirmationStatus: 'PENDING' });

      expect(result).toBe(1);
      const updated = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(updated?.deliberationStatus).toBe('ACCEPTED');
      expect(updated?.publicationStatus).toBe('PUBLISHED');
      expect(updated?.confirmationStatus).toBe('PENDING');
    });

    it('forces deliberation status to ACCEPTED and publication status to PUBLISHED when updating confirmation status', async () => {
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        // Default is PENDING deliberation status
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal.id], { confirmationStatus: 'CONFIRMED' });

      expect(result).toBe(1);
      const updated = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(updated?.deliberationStatus).toBe('ACCEPTED');
      expect(updated?.publicationStatus).toBe('PUBLISHED');
      expect(updated?.confirmationStatus).toBe('CONFIRMED');
    });

    it('returns 0 when neither deliberationStatus nor confirmationStatus is provided', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal.id], {});

      expect(result).toBe(0);
      // Verify proposal was not modified
      const updated = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(updated?.deliberationStatus).toBe('PENDING');
      expect(updated?.publicationStatus).toBe('NOT_PUBLISHED');
      expect(updated?.confirmationStatus).toBe(null);
    });

    it('does not update proposals with same deliberation status', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });
      const proposal2 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposal1.id, proposal2.id], { deliberationStatus: 'ACCEPTED' });

      expect(result).toBe(0); // No updates because they were already ACCEPTED
    });

    it('only updates proposals that have different deliberation status', async () => {
      const proposalAccepted = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });
      const proposalPending = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        // PENDING by default
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.update([proposalAccepted.id, proposalPending.id], {
        deliberationStatus: 'ACCEPTED',
      });

      expect(result).toBe(1); // Only the pending one was updated

      const updatedAccepted = await db.proposal.findUnique({ where: { id: proposalAccepted.id } });
      const updatedPending = await db.proposal.findUnique({ where: { id: proposalPending.id } });

      expect(updatedAccepted?.deliberationStatus).toBe('ACCEPTED');
      expect(updatedPending?.deliberationStatus).toBe('ACCEPTED');
    });

    it('does not update archived proposals deliberation status', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await proposalStatus.archive([proposal.id]);

      const result = await proposalStatus.update([proposal.id], { deliberationStatus: 'ACCEPTED' });

      expect(result).toBe(0);
      const updated = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(updated?.deliberationStatus).toBe('PENDING');
    });

    it('does not update archived proposals confirmation status', async () => {
      const proposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await proposalStatus.archive([proposal.id]);

      const result = await proposalStatus.update([proposal.id], { confirmationStatus: 'CONFIRMED' });

      expect(result).toBe(0);
      const updated = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(updated?.confirmationStatus).toBe(null);
    });
  });

  describe('#archive', () => {
    it('archives proposals by setting archivedAt timestamp', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.archive([proposal1.id, proposal2.id]);

      expect(result).toBe(2);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.archivedAt).not.toBe(null);

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.archivedAt).not.toBe(null);
    });

    it('does not archive already archived proposals', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await proposalStatus.archive([proposal.id]);
      const result = await proposalStatus.archive([proposal.id]);

      expect(result).toBe(0);
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await expect(proposalStatus.archive([proposal.id])).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
        await proposalStatus.archive([proposal.id]);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#restore', () => {
    it('restores archived proposals by clearing archivedAt timestamp', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await proposalStatus.archive([proposal1.id, proposal2.id]);

      const result = await proposalStatus.restore([proposal1.id, proposal2.id]);

      expect(result).toBe(2);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.archivedAt).toBe(null);

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.archivedAt).toBe(null);
    });

    it('does not restore non-archived proposals', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.restore([proposal.id]);

      expect(result).toBe(0);
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const ownerTeam = await getAuthorizedTeam(owner.id, team.slug);
      const ownerEvent = await getAuthorizedEvent(ownerTeam, event.slug);
      await ProposalStatusUpdater.for(ownerEvent).archive([proposal.id]);

      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await expect(proposalStatus.restore([proposal.id])).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const ownerTeam = await getAuthorizedTeam(owner.id, team.slug);
      const ownerEvent = await getAuthorizedEvent(ownerTeam, event.slug);
      await ProposalStatusUpdater.for(ownerEvent).archive([proposal.id]);

      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
        await proposalStatus.restore([proposal.id]);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#updateAll', () => {
    it('updates all proposals deliberation status from the search', async () => {
      const proposal1 = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.updateAll({ status: 'pending' }, 'REJECTED');

      expect(result).toBe(1);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('ACCEPTED');

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('REJECTED');
    });

    it('applies filters correctly when updating proposals', async () => {
      const format1 = await db.eventFormat.create({
        data: { name: 'Format 1', description: 'Description 1', eventId: event.id },
      });
      const format2 = await db.eventFormat.create({
        data: { name: 'Format 2', description: 'Description 2', eventId: event.id },
      });

      const proposal1 = await proposalFactory({
        event,
        formats: [format1],
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });
      const proposal2 = await proposalFactory({
        event,
        formats: [format2],
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.updateAll(
        {
          formats: format1.id, // Use single ID instead of array
          status: 'accepted',
        },
        'REJECTED',
      );

      expect(result).toBe(1);
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('REJECTED');

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('ACCEPTED'); // Unchanged
    });

    it('resets publication and confirmation statuses when changing to PENDING', async () => {
      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['accepted-published'],
      });
      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
        traits: ['confirmed'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.updateAll({}, 'PENDING');

      expect(result).toBe(2);
      const proposals = await db.proposal.findMany();

      proposals.forEach((proposal) => {
        expect(proposal.deliberationStatus).toBe('PENDING');
        expect(proposal.publicationStatus).toBe('NOT_PUBLISHED');
        expect(proposal.confirmationStatus).toBe(null);
      });
    });

    it('only resets publication status when changing from published to ACCEPTED/REJECTED', async () => {
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

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      const result = await proposalStatus.updateAll({ status: 'rejected' }, 'ACCEPTED');

      expect(result).toBe(1); // Only the rejected one was updated
      const proposals = await db.proposal.findMany();

      const updated1 = proposals.find((p) => p.id === proposal1.id);
      expect(updated1?.deliberationStatus).toBe('ACCEPTED');
      expect(updated1?.publicationStatus).toBe('PUBLISHED'); // Unchanged

      const updated2 = proposals.find((p) => p.id === proposal2.id);
      expect(updated2?.deliberationStatus).toBe('ACCEPTED');
      expect(updated2?.publicationStatus).toBe('NOT_PUBLISHED'); // Reset
    });

    it('does not update archived proposals when using updateAll', async () => {
      const activeProposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const archivedProposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposalStatus = ProposalStatusUpdater.for(authorizedEvent);
      await proposalStatus.archive([archivedProposal.id]);

      const result = await proposalStatus.updateAll({}, 'ACCEPTED');

      expect(result).toBe(1);
      const updatedActive = await db.proposal.findUnique({ where: { id: activeProposal.id } });
      const updatedArchived = await db.proposal.findUnique({ where: { id: archivedProposal.id } });

      expect(updatedActive?.deliberationStatus).toBe('ACCEPTED');
      expect(updatedArchived?.deliberationStatus).toBe('PENDING');
    });

    it('throws an error if user has not a owner or member role in the team', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const deliberate = ProposalStatusUpdater.for(authorizedEvent);
      await expect(deliberate.updateAll({}, 'ACCEPTED')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const deliberate = ProposalStatusUpdater.for(authorizedEvent);
        await deliberate.updateAll({}, 'ACCEPTED');
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
