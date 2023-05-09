import type { ProposalsFilters } from '~/schemas/proposal';
import { jsonToArray } from '~/libs/prisma';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';
import { OrganizerProposalsSearch } from '~/shared-server/proposals/OrganizerProposalsSearch';
import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';
import type { UserSocialLinks } from '~/schemas/user';

export type ProposalReview = Awaited<ReturnType<typeof getProposalReview>>;

export async function getProposalReview(
  eventSlug: string,
  proposalId: string,
  userId: string,
  filters: ProposalsFilters
) {
  const event = await allowedForEvent(eventSlug, userId);

  const options = { searchBySpeakers: event.displayProposalsSpeakers };

  const search = new OrganizerProposalsSearch(eventSlug, userId, filters, options);
  const proposalIds = await search.proposalsIds();

  const totalProposals = proposalIds.length;
  const curIndex = proposalIds.findIndex((id) => id === proposalId);
  const previousId = proposalIds.at(curIndex - 1);
  const nextId = curIndex + 1 >= totalProposals ? proposalIds.at(0) : proposalIds.at(curIndex + 1);

  const proposal = await db.proposal.findFirst({
    include: {
      speakers: event.displayProposalsSpeakers,
      formats: true,
      categories: true,
      ratings: { include: { user: true } },
      messages: { include: { user: true } },
    },
    where: { id: proposalId },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const ratings = new RatingsDetails(proposal.ratings);

  return {
    pagination: {
      total: totalProposals,
      current: curIndex + 1,
      previousId,
      nextId,
    },
    event,
    proposal: {
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      comments: proposal.comments,
      level: proposal.level,
      status: proposal.status,
      languages: jsonToArray(proposal.languages),
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      speakers: event.displayProposalsSpeakers
        ? proposal.speakers.map((speaker) => ({
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
            bio: speaker.bio,
            references: speaker.references,
            email: speaker.email,
            company: speaker.company,
            address: speaker.address,
            socials: speaker.socials as UserSocialLinks,
          }))
        : [],
      ratings: {
        you: ratings.ofUser(userId),
        summary: event.displayProposalsRatings ? ratings.summary() : undefined,
        members: event.displayProposalsRatings ? ratings.ofMembers() : [],
      },
      messages: proposal.messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((message) => ({
          id: message.id,
          userId: message.userId,
          name: message.user.name,
          picture: message.user.picture,
          message: message.message,
        })),
    },
  };
}
