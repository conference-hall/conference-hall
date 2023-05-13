import { BuildingLibraryIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/react/20/solid';

import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { IconLabel } from '~/design-system/IconLabel';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon';
import { Card } from '~/design-system/layouts/Card';
import { Markdown } from '~/design-system/Markdown';
import { H3, Subtitle } from '~/design-system/Typography';
import type { UserSocialLinks } from '~/schemas/user';

type Props = {
  name: string | null;
  email: string | null;
  picture: string | null;
  bio: string | null;
  address: string | null;
  company: string | null;
  socials: UserSocialLinks;
};

export function SpeakerDetailsSection({ name, email, picture, bio, address, company, socials }: Props) {
  const { github, twitter } = socials;
  const displayInfo = address || company || twitter || github;

  return (
    <Card as="section" p={8} className="space-y-6">
      <div className="flex gap-4">
        <Avatar picture={picture} size="l" />
        <div className="truncate">
          <H3 mb={0} truncate>
            {name}
          </H3>
          <Subtitle size="xs" truncate>
            {email}
          </Subtitle>
        </div>
      </div>

      {bio && <Markdown className="line-clamp-5" source={bio} />}

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
