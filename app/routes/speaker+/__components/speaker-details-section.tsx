import { MapPinIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/buttons.cap.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { TwitterIcon } from '~/design-system/icons/twitter-icon.tsx';
import { Card } from '~/design-system/layouts/card.cap.tsx';
import { Markdown } from '~/design-system/markdown.cap.tsx';
import { Text } from '~/design-system/typography.cap.tsx';

type Props = {
  email: string | null;
  picture: string | null;
  bio: string | null;
  address: string | null;
  socials: {
    github: string | null;
    twitter: string | null;
  };
};

export function SpeakerDetailsSection({ bio, address, socials }: Props) {
  const { github, twitter } = socials;
  const displayInfo = address || twitter || github;

  return (
    <div className="hidden sm:block space-y-6">
      <Card>
        <div className="p-6">
          {bio ? <Markdown className="line-clamp-5">{bio}</Markdown> : <Text>Fill your profile</Text>}
        </div>

        {displayInfo && (
          <div className="p-6 space-y-4 border-t border-t-gray-200">
            {address && <IconLabel icon={MapPinIcon}>{address}</IconLabel>}
            {twitter && <IconLabel icon={TwitterIcon}>{twitter}</IconLabel>}
            {github && <IconLabel icon={GitHubIcon}>{github}</IconLabel>}
          </div>
        )}
      </Card>

      <div className="space-y-2">
        <ButtonLink to="profile" variant="secondary" iconLeft={PencilSquareIcon} block>
          Edit your profile
        </ButtonLink>
        <ButtonLink to="talks/new" variant="secondary" iconLeft={PlusIcon} block>
          New talk
        </ButtonLink>
      </div>
    </div>
  );
}
