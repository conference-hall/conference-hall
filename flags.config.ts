import { defineFlagsConfig } from './app/libs/feature-flags/flags-client.ts';

export default defineFlagsConfig({
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  userPreferences: {
    description: 'Enabled user preferences settings.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
