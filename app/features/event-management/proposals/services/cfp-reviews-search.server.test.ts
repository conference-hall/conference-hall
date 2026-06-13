import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { Team, User } from '../../../../../prisma/generated/client.ts';
import { CfpReviewsSearch } from './cfp-reviews-search.server.ts';

describe('CfpReviewsSearch', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member] });
  });

  describe('#search', () => {
    it('returns event proposals info', async () => {
      const event = await eventFactory({ team });
      const tag = await eventProposalTagFactory({ event });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), tags: [tag] });
      const reviewConversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        type: 'PROPOSAL_REVIEW_COMMENTS',
      });
      await conversationMessageFactory({ conversation: reviewConversation, sender: owner });
      const speakerConversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        type: 'PROPOSAL_SPEAKER_CONVERSATION',
      });
      await conversationMessageFactory({ conversation: speakerConversation, sender: speaker });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposals = await CfpReviewsSearch.for(authorizedEvent).search({ status: 'pending' });

      expect(proposals.results).toEqual([
        {
          id: proposal.id,
          routeId: proposal.routeId,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          publicationStatus: proposal.publicationStatus,
          archivedAt: proposal.archivedAt,
          submittedAt: proposal.submittedAt,
          speakers: [{ name: speaker.name, picture: speaker.picture }],
          tags: [{ id: tag.id, name: tag.name, color: tag.color }],
          reviews: {
            summary: { negatives: 0, positives: 0, average: null },
            you: { note: null, feeling: null },
          },
          commentCount: 1,
          hasNewMessages: true,
        },
      ]);

      expect(proposals.filters).toEqual({ status: 'pending' });
      expect(proposals.statistics).toEqual({ reviewed: 0, total: 1, hasNewMessages: true });
      expect(proposals.pagination).toEqual({ current: 1, total: 1 });
    });

    it('does not return speakers when display proposal speakers is false', async () => {
      const event = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      let proposals = await CfpReviewsSearch.for(authorizedEvent).search({});
      expect(proposals.results[0]?.speakers).toEqual([]);

      proposals = await CfpReviewsSearch.for(authorizedEvent).search({ query: 'parker' });
      expect(proposals.results.length).toEqual(0);
    });

    it('does not return reviews when display proposal reviews is false', async () => {
      const event = await eventFactory({ team, attributes: { displayProposalsReviews: false } });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});
      expect(proposals.results[0].reviews.summary).toBeUndefined();
    });

    it('returns empty results of an event without proposals', async () => {
      const event = await eventFactory({ team });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

      expect(proposals.results).toEqual([]);
      expect(proposals.filters).toEqual({});
      expect(proposals.statistics).toEqual({ reviewed: 0, total: 0, hasNewMessages: false });
      expect(proposals.pagination).toEqual({ current: 1, total: 0 });
    });

    describe('statistics.hasNewMessages', () => {
      it('returns true for a speaker conversation message even when the user is not a participant', async () => {
        const event = await eventFactory({ team });
        const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({ conversation, sender: speaker });

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

        expect(proposals.statistics.hasNewMessages).toBe(true);
      });

      it('returns false for a review comments conversation when the user is not a participant', async () => {
        const event = await eventFactory({ team });
        const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        await conversationMessageFactory({ conversation, sender: member });

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

        expect(proposals.statistics.hasNewMessages).toBe(false);
      });

      it('returns true for a review comments conversation when the participant user has never seen it', async () => {
        const event = await eventFactory({ team });
        const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
          attributes: {
            participants: { create: { user: { connect: { id: owner.id } }, role: 'ORGANIZER' } },
          },
        });
        await conversationMessageFactory({ conversation, sender: member });

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

        expect(proposals.statistics.hasNewMessages).toBe(true);
      });

      it('returns false when the user has seen all messages', async () => {
        const event = await eventFactory({ team });
        const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
          attributes: {
            participants: {
              create: { user: { connect: { id: owner.id } }, role: 'ORGANIZER', lastSeenAt: new Date() },
            },
          },
        });
        await conversationMessageFactory({
          conversation,
          sender: member,
          attributes: { createdAt: new Date(Date.now() - 60_000) },
        });

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

        expect(proposals.statistics.hasNewMessages).toBe(false);
      });

      it('returns false when the only messages are sent by the user', async () => {
        const event = await eventFactory({ team });
        const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({ conversation, sender: owner });

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

        expect(proposals.statistics.hasNewMessages).toBe(false);
      });

      it('returns false for unseen messages on draft or archived proposals', async () => {
        const event = await eventFactory({ team });
        const draft = await proposalFactory({
          event,
          talk: await talkFactory({ speakers: [speaker] }),
          traits: ['draft'],
        });
        const archived = await proposalFactory({
          event,
          talk: await talkFactory({ speakers: [speaker] }),
          traits: ['archived'],
        });
        for (const proposal of [draft, archived]) {
          const conversation = await conversationFactory({
            event,
            proposalId: proposal.id,
            type: 'PROPOSAL_SPEAKER_CONVERSATION',
          });
          await conversationMessageFactory({ conversation, sender: speaker });
        }

        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const proposals = await CfpReviewsSearch.for(authorizedEvent).search({});

        expect(proposals.statistics.hasNewMessages).toBe(false);
      });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const reviewsSearch = CfpReviewsSearch.for(authorizedEvent);
        await reviewsSearch.search({});
      }).rejects.toThrow(ForbiddenOperationError);
    });
  });
});
