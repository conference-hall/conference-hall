import { db } from '~/libs/db.ts';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/libs/errors.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';
import type { SurveyData } from '~/routes/__types/survey.ts';
import type { UserSocialLinks } from '~/routes/__types/user.ts';
import { sortBy } from '~/utils/arrays.ts';

export async function getSpeakers(eventSlug: string, proposalId: string, userId: string) {
  const event = await allowedForEvent(eventSlug, userId);

  if (!event.displayProposalsSpeakers) throw new ForbiddenOperationError();

  const proposal = await db.proposal.findUnique({ include: { speakers: true }, where: { id: proposalId } });

  if (!proposal) throw new ProposalNotFoundError();

  const surveys = await db.survey.findMany({
    where: { eventId: event.id, userId: { in: proposal?.speakers.map(({ id }) => id) } },
  });

  return sortBy(
    proposal.speakers.map((speaker) => {
      const survey = surveys.find((survey) => survey.userId === speaker.id);

      return {
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
        bio: speaker.bio,
        references: speaker.references,
        email: speaker.email,
        company: speaker.company,
        address: speaker.address,
        socials: speaker.socials as UserSocialLinks,
        survey: survey?.answers as SurveyData | undefined,
      };
    }),
    'name',
  );
}
