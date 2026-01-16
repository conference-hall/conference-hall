import type { Event, Team, User } from 'prisma/generated/client.ts';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import { resolveProposalId } from './proposal-id-resolver.server.ts';

describe('resolveProposalId', () => {
  let user: User;
  let team: Team;
  let event: Event;
  let event2: Event;
  let authorizedEvent: AuthorizedEvent;
  let authorizedEvent2: AuthorizedEvent;

  beforeEach(async () => {
    user = await userFactory();
    team = await teamFactory({ owners: [user] });
    event = await eventFactory({ team });
    event2 = await eventFactory({ team });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
    authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
    authorizedEvent2 = await getAuthorizedEvent(authorizedTeam, event2.slug);
  });

  describe('when param is a proposal Id', () => {
    it('returns the param unchanged when it is a valid proposal Id', async () => {
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event, talk });

      const result = await resolveProposalId(authorizedEvent, proposal.id);

      expect(result).toBe(proposal.id);
    });

    it('returns proposal Id even when proposal number exists', async () => {
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event, talk });
      await db.proposal.update({ where: { id: proposal.id }, data: { proposalNumber: 42 } });

      const result = await resolveProposalId(authorizedEvent, proposal.id);

      expect(result).toBe(proposal.id);
    });
  });

  describe('when param is a proposal number', () => {
    it('resolves proposal number to proposal Id when param is numeric', async () => {
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event, talk });
      await db.proposal.update({ where: { id: proposal.id }, data: { proposalNumber: 123 } });

      const result = await resolveProposalId(authorizedEvent, '123');

      expect(result).toBe(proposal.id);
    });

    it('coerces numeric strings with leading zeros', async () => {
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event, talk });
      await db.proposal.update({ where: { id: proposal.id }, data: { proposalNumber: 42 } });

      const result = await resolveProposalId(authorizedEvent, '042');

      expect(result).toBe(proposal.id);
    });
  });

  describe('error handling', () => {
    it('throws ProposalNotFoundError when proposal number does not exist for event', async () => {
      await expect(resolveProposalId(authorizedEvent, '999')).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws ProposalNotFoundError when proposal number belongs to different event', async () => {
      const talk = await talkFactory({ speakers: [user] });
      const proposal = await proposalFactory({ event: event2, talk });
      await db.proposal.update({ where: { id: proposal.id }, data: { proposalNumber: 456 } });

      await expect(resolveProposalId(authorizedEvent, '456')).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws ProposalNotFoundError for negative numbers', async () => {
      await expect(resolveProposalId(authorizedEvent, '-1')).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('edge cases', () => {
    it('resolves correct proposal when multiple proposals exist', async () => {
      const talk1 = await talkFactory({ speakers: [user] });
      const talk2 = await talkFactory({ speakers: [user] });
      const talk3 = await talkFactory({ speakers: [user] });

      const proposal1 = await proposalFactory({ event, talk: talk1 });
      const proposal2 = await proposalFactory({ event, talk: talk2 });
      const proposal3 = await proposalFactory({ event, talk: talk3 });

      await db.proposal.update({ where: { id: proposal1.id }, data: { proposalNumber: 1 } });
      await db.proposal.update({ where: { id: proposal2.id }, data: { proposalNumber: 2 } });
      await db.proposal.update({ where: { id: proposal3.id }, data: { proposalNumber: 3 } });

      const result1 = await resolveProposalId(authorizedEvent, '1');
      const result2 = await resolveProposalId(authorizedEvent, '2');
      const result3 = await resolveProposalId(authorizedEvent, '3');

      expect(result1).toBe(proposal1.id);
      expect(result2).toBe(proposal2.id);
      expect(result3).toBe(proposal3.id);
    });

    it('maintains event isolation when same proposal number exists in different events', async () => {
      const talk1 = await talkFactory({ speakers: [user] });
      const talk2 = await talkFactory({ speakers: [user] });

      const proposalEvent1 = await proposalFactory({ event, talk: talk1 });
      const proposalEvent2 = await proposalFactory({ event: event2, talk: talk2 });

      await db.proposal.update({ where: { id: proposalEvent1.id }, data: { proposalNumber: 100 } });
      await db.proposal.update({ where: { id: proposalEvent2.id }, data: { proposalNumber: 100 } });

      const resultEvent1 = await resolveProposalId(authorizedEvent, '100');
      const resultEvent2 = await resolveProposalId(authorizedEvent2, '100');

      expect(resultEvent1).toBe(proposalEvent1.id);
      expect(resultEvent2).toBe(proposalEvent2.id);
      expect(resultEvent1).not.toBe(resultEvent2);
    });
  });
});
