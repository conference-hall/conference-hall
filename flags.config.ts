import { defineFlagsConfig } from './app/libs/feature-flags/flags-client.ts';

export default defineFlagsConfig({
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  reviewsDashboard: {
    description: 'Enables the reviews dashboard in overview.',
    type: 'string',
    defaultValue: 'gdg-nantes',
    tags: ['frontend'] as const,
  },
  emailCustomization: {
    description:
      'Enables custom email templates for speakers (proposal-submitted, proposal-accepted, proposal-declined).',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
