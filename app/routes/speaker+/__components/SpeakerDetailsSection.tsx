import { BuildingLibraryIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/react/20/solid';

import { Avatar } from '~/design-system/Avatar.tsx';
import { ButtonLink } from '~/design-system/Buttons.tsx';
import { IconLabel } from '~/design-system/IconLabel.tsx';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon.tsx';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H3, Subtitle } from '~/design-system/Typography.tsx';
import type { SpeakerSocialLinks } from '~/domains/speaker/SpeakerProfile';

type Props = {
  name: string | null;
  email: string | null;
  picture: string | null;
  bio: string | null;
  address: string | null;
  company: string | null;
  socials: SpeakerSocialLinks;
};

export function SpeakerDetailsSection({ name, email, picture, bio, address, company, socials }: Props) {
  const { github, twitter } = socials;
  const displayInfo = address || company || twitter || github;

  return (
    <Card as="section" p={8} className="space-y-6">
      <div className="flex gap-4">
        <Avatar picture={picture} size="l" />
        <div className="truncate">
          <H3 truncate>{name}</H3>
          <Subtitle size="xs" truncate>
            {email}
          </Subtitle>
        </div>
      </div>

      {bio && <Markdown className="line-clamp-5">{bio}</Markdown>}

      {displayInfo && (
        <div className="space-y-4">
          {address && <IconLabel icon={MapPinIcon}>{address}</IconLabel>}
          {company && <IconLabel icon={BuildingLibraryIcon}>{company}</IconLabel>}
          {twitter && <IconLabel icon={TwitterIcon}>{twitter}</IconLabel>}
          {github && <IconLabel icon={GitHubIcon}>{github}</IconLabel>}
        </div>
      )}

      <ButtonLink to="profile" variant="secondary" iconLeft={PencilSquareIcon} block>
        Edit your profile
      </ButtonLink>
    </Card>
  );
}
