import { MapPinIcon, PencilSquareIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { TwitterIcon } from '~/design-system/icons/twitter-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  email: string | null;
  picture: string | null;
  bio: string | null;
  location: string | null;
  socials: {
    github: string | null;
    twitter: string | null;
  };
};

export function SpeakerDetailsSection({ bio, location, socials }: Props) {
  const { github, twitter } = socials;
  const displayInfo = location || twitter || github;

  return (
    <div className="hidden sm:block space-y-6">
      <Card>
        <div className="p-6">
          {bio ? <Markdown className="line-clamp-5">{bio}</Markdown> : <Text variant="secondary">(No profile)</Text>}
        </div>

        {displayInfo && (
          <div className="p-6 space-y-4 border-t border-t-gray-200">
            {location && <IconLabel icon={MapPinIcon}>{location}</IconLabel>}
            {twitter && <IconLabel icon={TwitterIcon}>{twitter}</IconLabel>}
            {github && <IconLabel icon={GitHubIcon}>{github}</IconLabel>}
          </div>
        )}

        <div className="px-2 pb-2 pt-2 border-t border-t-gray-200">
          <ButtonLink to="profile" variant="secondary" iconLeft={PencilSquareIcon} block>
            Edit your profile
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
