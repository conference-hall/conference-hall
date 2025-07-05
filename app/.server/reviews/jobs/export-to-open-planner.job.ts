import { EventIntegrations } from '~/.server/event-settings/event-integrations.ts';
import { ProposalSearchBuilder } from '~/.server/shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import type { SocialLinks } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { extractSocialProfile } from '~/libs/formatters/social-links.ts';
import { OpenPlanner, type OpenPlannerSessionsPayload } from '~/libs/integrations/open-planner.ts';
import { compactObject } from '~/libs/utils/object-compact.ts';
import { job } from '~/shared/jobs/job.ts';
import type { Languages } from '~/types/proposals.types.ts';

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
