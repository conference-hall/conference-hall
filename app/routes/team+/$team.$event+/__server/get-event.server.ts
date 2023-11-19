import { db } from '~/libs/db.ts';
import { EventNotFoundError } from '~/libs/errors.ts';
import { jsonToArray } from '~/libs/prisma.ts';
import { getCfpState } from '~/utils/event.ts';

export type TeamEvent = Awaited<ReturnType<typeof getTeamEvent>>;

export async function getTeamEvent(slug: string, userId: string) {
  const event = await db.event.findFirst({
    include: { formats: true, categories: true },
    where: { slug, team: { members: { some: { memberId: userId } } } },
  });
  if (!event) throw new EventNotFoundError();

  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    type: event.type,
    address: event.address,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
    description: event.description,
    visibility: event.visibility,
    websiteUrl: event.websiteUrl,
    codeOfConductUrl: event.codeOfConductUrl,
    contactEmail: event.contactEmail,
    logo: event.logo,
    maxProposals: event.maxProposals,
    surveyEnabled: event.surveyEnabled,
    surveyQuestions: jsonToArray(event.surveyQuestions),
    reviewEnabled: event.reviewEnabled,
    displayProposalsReviews: event.displayProposalsReviews,
    displayProposalsSpeakers: event.displayProposalsSpeakers,
    formatsRequired: event.formatsRequired,
    categoriesRequired: event.categoriesRequired,
    emailOrganizer: event.emailOrganizer,
    emailNotifications: jsonToArray(event.emailNotifications),
    slackWebhookUrl: event.slackWebhookUrl,
    apiKey: event.apiKey,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    formats: event.formats.map(({ id, name, description }) => ({ id, name, description })),
    categories: event.categories.map(({ id, name, description }) => ({ id, name, description })),
    archived: event.archived,
  };
}
