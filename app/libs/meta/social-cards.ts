const IMAGE_HEIGHT = '200';
const IMAGE_WIDTH = '200';

type SocialCard = { name: string; slug: string; logoUrl: string | null };

export function eventSocialCard({ name, slug, logoUrl }: SocialCard) {
  const meta: Record<string, string>[] = [
    { property: 'og:title', content: `${name} call for papers` },
    { property: 'og:description', content: `Submit your proposal to ${name} call for papers.` },
    { property: 'og:type', content: 'event' },
    { property: 'og:url', content: `https://conference-hall.io/${slug}` },
    { name: 'twitter:title', content: `${name} call for papers` },
    { name: 'twitter:card', content: 'summary' },
  ];

  if (logoUrl) {
    meta.push({ name: 'twitter:image', content: logoUrl });
    meta.push({ property: 'og:image', content: logoUrl });
    meta.push({ property: 'og:image:width', content: IMAGE_WIDTH });
    meta.push({ property: 'og:image:height', content: IMAGE_HEIGHT });
  }

  return meta;
}
