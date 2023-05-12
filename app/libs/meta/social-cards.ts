const IMAGE_HEIGHT = '200';
const IMAGE_WIDTH = '200';

type SocialCard = { name: string; slug: string; logo: string | null };

export function eventSocialCard({ name, slug, logo }: SocialCard) {
  const meta: Record<string, string>[] = [
    { property: 'og:title', content: `${name} call for paper` },
    { property: 'og:description', content: `Submit your proposal to ${name} call for paper on Conference Hall.` },
    { property: 'og:type', content: 'event' },
    { property: 'og:url', content: `https://conference-hall.io/${slug}` },
    { property: 'twitter:title', content: `${name} call for paper` },
  ];

  if (logo) {
    meta.push({ property: 'og:image', content: logo });
    meta.push({ property: 'og:image:width', content: IMAGE_WIDTH });
    meta.push({ property: 'og:image:height', content: IMAGE_HEIGHT });
    meta.push({ property: 'twitter:image', content: logo });
    meta.push({ property: 'twitter:card', content: 'summary_large_image' });
  } else {
    meta.push({ property: 'twitter:card', content: 'summary' });
  }

  return meta;
}
