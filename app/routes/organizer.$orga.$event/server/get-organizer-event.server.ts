import { getCfpState } from '~/utils/event';
import { jsonToArray } from '~/libs/prisma';
import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';

export type OrganizerEvent = Awaited<ReturnType<typeof getOrganizerEvent>>;

export async function getOrganizerEvent(slug: string, uid: string) {
  const event = await db.event.findFirst({
    include: { formats: true, categories: true },
    where: { slug, organization: { members: { some: { memberId: uid } } } },
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
    bannerUrl: event.bannerUrl,
    maxProposals: event.maxProposals,
    surveyEnabled: event.surveyEnabled,
    surveyQuestions: jsonToArray(event.surveyQuestions),
    deliberationEnabled: event.deliberationEnabled,
    displayOrganizersRatings: event.displayOrganizersRatings,
    displayProposalsRatings: event.displayProposalsRatings,
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
