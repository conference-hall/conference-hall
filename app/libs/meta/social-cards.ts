const IMAGE_HEIGHT = '200';
const IMAGE_WIDTH = '200';

type SocialCard = { name: string; logo: string | null; websiteUrl: string | null };

export function eventSocialCard({ name, logo, websiteUrl }: SocialCard) {
  const meta: Record<string, string>[] = [
    { property: 'og:title', content: name },
    { property: 'og:description', content: `Call for paper for ${name}.` },
    { property: 'og:type', content: 'event' },
    { property: 'og:site_name', content: 'Conference Hall' },
    { property: 'twitter:title', content: name },
    { property: 'twitter:card', content: 'summary' },
  ];

  if (websiteUrl) {
    meta.push({ property: 'og:url', content: websiteUrl });
  }

  if (logo) {
    meta.push({ property: 'og:image', content: logo });
    meta.push({ property: 'og:image:width', content: IMAGE_WIDTH });
    meta.push({ property: 'og:image:height', content: IMAGE_HEIGHT });
    meta.push({ property: 'twitter:image', content: logo });
  }

  return meta;
}
