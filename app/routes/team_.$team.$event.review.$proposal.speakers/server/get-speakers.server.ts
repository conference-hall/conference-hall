import { db } from '~/libs/db';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/libs/errors';
import type { SurveyData } from '~/schemas/survey';
import type { UserSocialLinks } from '~/schemas/user';
import { allowedForEvent } from '~/server/teams/check-user-role.server';
import { sortBy } from '~/utils/arrays';

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
