import { defineFlagsConfig } from './app/libs/feature-flags/flags-client.ts';

export default defineFlagsConfig({
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  aiIntegration: {
    description: 'Enabled AI integration for a team slug.',
    type: 'string',
    defaultValue: 'gdg-nantes',
    tags: ['frontend'] as const,
  },
  speakersPage: {
    description: 'Enables the speakers page in event management.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
