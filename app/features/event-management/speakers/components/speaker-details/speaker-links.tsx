import { EnvelopeIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { ExternalLink } from '~/design-system/links.tsx';
import { SocialLink } from '~/design-system/social-link.tsx';

type Props = {
  email?: string;
  location?: string | null;
  socialLinks?: Array<string>;
  className?: string;
};

export function SpeakerLinks({ email, location, socialLinks, className }: Props) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {location ? (
        <ExternalLink
          iconLeft={MapPinIcon}
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
          variant="secondary"
        >
          {location}
        </ExternalLink>
      ) : null}

      {email ? (
        <ExternalLink iconLeft={EnvelopeIcon} href={`mailto:${email}`} variant="secondary">
          {email}
        </ExternalLink>
      ) : null}

      {socialLinks?.map((socialLink) => (
        <SocialLink key={socialLink} url={socialLink} />
      ))}
    </div>
  );
}
