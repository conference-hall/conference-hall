export type SocialName =
  | 'link'
  | 'github'
  | 'x'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'bluesky'
  | 'reddit'
  | 'pinterest';

const SOCIAL_PLATFORMS: Record<string, SocialName> = {
  'github.com': 'github',
  'twitter.com': 'x',
  'x.com': 'x',
  'linkedin.com': 'linkedin',
  'facebook.com': 'facebook',
  'instagram.com': 'instagram',
  'tiktok.com': 'tiktok',
  'youtube.com': 'youtube',
  'bsky.app': 'bluesky',
  'reddit.com': 'reddit',
  'pinterest.com': 'pinterest',
};

export function extractSocialProfile(url: string): { name: SocialName; profile: string | null; url: string } {
  try {
    const parsedUrl = new URL(url);
    const domain = extractMainDomain(parsedUrl.hostname);

    const platform = SOCIAL_PLATFORMS[domain] || 'link';
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const profile = segments.length > 0 ? segments[segments.length - 1] : null;

    if (platform === 'link' || profile === null) {
      return { name: 'link', profile: null, url };
    }

    return { name: platform, profile, url };
  } catch {
    return { name: 'link', profile: null, url };
  }
}

function extractMainDomain(hostname: string) {
  const match = hostname.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/);
  return match ? match[0] : '';
}
