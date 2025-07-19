import { defineFlagsConfig } from './app/shared/feature-flags/flags-client.ts';

export default defineFlagsConfig({
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  emailCustomization: {
    description:
      'Enables custom email templates for speakers (proposal-submitted, proposal-accepted, proposal-declined).',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  organizerProposalCreation: {
    description: 'Enables organizers to create proposals directly from the proposals list page.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
