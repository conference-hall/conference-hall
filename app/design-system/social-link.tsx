import { LinkIcon } from '@heroicons/react/20/solid';
import { extractSocialProfile, type SocialName } from '~/libs/formatters/social-links.ts';
import { BlueSkyIcon } from './icons/bluesky-icon.tsx';
import { GitHubIcon } from './icons/github-icon.tsx';
import { InstagramIcon } from './icons/instagram-icon.tsx';
import { LinkedInIcon } from './icons/linkedin-icon.tsx';
import { XIcon } from './icons/x-icon.tsx';
import { ExternalLink } from './links.tsx';

type Props = { url: string };

export function SocialLink({ url }: Props) {
  const { name, profile } = extractSocialProfile(url);
  const Icon = getSocialIcon(name);

  return (
    <ExternalLink iconLeft={Icon} href={url} variant="secondary">
      {profile ? `@${profile}` : url}
    </ExternalLink>
  );
}

export function getSocialIcon(name: SocialName) {
  if (name === 'x') {
    return XIcon;
  } else if (name === 'github') {
    return GitHubIcon;
  } else if (name === 'bluesky') {
    return BlueSkyIcon;
  } else if (name === 'linkedin') {
    return LinkedInIcon;
  } else if (name === 'instagram') {
    return InstagramIcon;
  } else {
    return LinkIcon;
  }
}
