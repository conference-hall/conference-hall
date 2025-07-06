import { eventSocialCard } from './social-cards.ts';

describe('eventSocialCard', () => {
  it('returns an event social card with a logo', () => {
    const socialCard = eventSocialCard({ name: 'Devfest', slug: 'devfest', logoUrl: 'https://devfest.com/logo.png' });

    expect(socialCard).toEqual([
      { content: 'Devfest call for papers', property: 'og:title' },
      { content: 'Submit your proposal to Devfest call for papers.', property: 'og:description' },
      { content: 'event', property: 'og:type' },
      { content: 'https://conference-hall.io/devfest', property: 'og:url' },
      { content: 'Devfest call for papers', name: 'twitter:title' },
      { content: 'summary', name: 'twitter:card' },
      { content: 'https://devfest.com/logo.png', name: 'twitter:image' },
      { content: 'https://devfest.com/logo.png', property: 'og:image' },
      { content: '200', property: 'og:image:width' },
      { content: '200', property: 'og:image:height' },
    ]);
  });

  it('returns an event social card without a logo', () => {
    const socialCard = eventSocialCard({ name: 'Devfest', slug: 'devfest', logoUrl: null });

    expect(socialCard).toEqual([
      { content: 'Devfest call for papers', property: 'og:title' },
      { content: 'Submit your proposal to Devfest call for papers.', property: 'og:description' },
      { content: 'event', property: 'og:type' },
      { content: 'https://conference-hall.io/devfest', property: 'og:url' },
      { content: 'Devfest call for papers', name: 'twitter:title' },
      { content: 'summary', name: 'twitter:card' },
    ]);
  });
});
