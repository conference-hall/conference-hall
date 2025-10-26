import { defineFlagsConfig } from './app/shared/feature-flags/flags-client.ts';

export default defineFlagsConfig({
  captcha: {
    description: 'Enables captcha for email/password authentication.',
    type: 'boolean',
    defaultValue: false,
  },
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  speakersCommunication: {
    description: 'Enables communication between speakers and organizers.',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
});
