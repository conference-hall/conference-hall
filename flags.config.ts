import { defineFlagsConfig } from './app/libs/feature-flags/flags-client';

export default defineFlagsConfig({
  'custom-survey': {
    description: 'Enables custom survey feature.',
    type: 'boolean',
    defaultValue: false,
  },
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
