import { defineFlagsConfig } from './app/libs/feature-flags/flags-client.ts';

export default defineFlagsConfig({
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  emailPasswordSignin: {
    description: 'Enables email and password sign in.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
