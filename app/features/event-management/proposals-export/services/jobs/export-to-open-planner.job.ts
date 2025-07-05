import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from '~/features/event-management/proposals/services/proposal-search-builder.server.ts';
import { EventIntegrations } from '~/features/event-management/settings/services/event-integrations.server.ts';
import { extractSocialProfile } from '~/shared/formatters/social-links.ts';
import { OpenPlanner, type OpenPlannerSessionsPayload } from '~/shared/integrations/open-planner.server.ts';
import { job } from '~/shared/jobs/job.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import { compactObject } from '~/shared/utils/object-compact.ts';

type ExportToOpenPlannerPayload = {
  userId: string;
  teamSlug: string;
  eventSlug: string;
  filters: ProposalsFilters;
};

export const exportToOpenPlanner = job<ExportToOpenPlannerPayload>({
  name: 'export-to-open-planner',
  queue: 'default',
  run: async ({ userId, teamSlug, eventSlug, filters }: ExportToOpenPlannerPayload) => {
    const eventIntegrations = await EventIntegrations.for(userId, teamSlug, eventSlug);

    const openPlanner = await eventIntegrations.getConfiguration('OPEN_PLANNER');
    if (!openPlanner || openPlanner.name !== 'OPEN_PLANNER') return;

    const search = new ProposalSearchBuilder(eventSlug, userId, filters, {
      withSpeakers: true,
      withReviews: false,
    });

    const proposals = await search.proposals();

    const payload = proposals.reduce<OpenPlannerSessionsPayload>(
      (result, proposal) => {
        // add sessions
        const format = proposal.formats?.at(0);
        const category = proposal.categories?.at(0);
        const languages = proposal.languages as Languages;

        result.sessions.push(
          compactObject({
            id: proposal.id,
            title: proposal.title,
            abstract: proposal.abstract,
            language: languages.at(0),
            level: proposal.level,
            speakerIds: proposal.speakers.map((s) => s.id),
            formatId: format?.id,
            formatName: format?.name,
            categoryId: category?.id,
            categoryName: category?.name,
            showInFeedback: true,
          }),
        );

        // add speakers
        for (const speaker of proposal.speakers) {
          if (result.speakers.some((s) => s.id === speaker.id)) {
            continue;
          }

          const socialLinks = speaker.socialLinks as SocialLinks;
          const socials = socialLinks.map((link) => {
            const { name, url } = extractSocialProfile(link);
            return { name, icon: name, link: url };
          });

          result.speakers.push(
            compactObject({
              id: speaker.id,
              name: speaker.name,
              email: speaker.email,
              bio: speaker.bio,
              company: speaker.company,
              photoUrl: speaker.picture,
              geolocation: speaker.location,
              socials,
            }),
          );
        }

        return result;
      },
      { sessions: [], speakers: [] },
    );

    const { eventId, apiKey } = openPlanner.configuration;
    await OpenPlanner.postSessionsAndSpeakers(eventId, apiKey, payload);
  },
});
