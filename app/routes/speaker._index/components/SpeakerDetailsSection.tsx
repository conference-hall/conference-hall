import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { GlobeAltIcon, HeartIcon, HomeIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/Card';
import { IconLabel } from '~/design-system/IconLabel';
import { Markdown } from '~/design-system/Markdown';
import { H3, Subtitle } from '~/design-system/Typography';

type Props = {
  name: string | null;
  email: string | null;
  photoURL: string | null;
  bio: string | null;
  address: string | null;
  company: string | null;
  twitter: string | null;
  github: string | null;
};

export function SpeakerDetailsSection({ name, email, photoURL, bio, address, company, twitter, github }: Props) {
  const displayInfo = address || company || twitter || github;

  return (
    <Card as="section" rounded="2xl" p={8} className="space-y-6">
      <div className="flex gap-4">
        <Avatar photoURL={photoURL} size="l" />
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
          {company && <IconLabel icon={HomeIcon}>{company}</IconLabel>}
          {twitter && <IconLabel icon={HeartIcon}>{twitter}</IconLabel>}
          {github && <IconLabel icon={GlobeAltIcon}>{github}</IconLabel>}
        </div>
      )}

      <ButtonLink to="profile" variant="secondary" iconLeft={PencilSquareIcon} block>
        Edit your profile
      </ButtonLink>
    </Card>
  );
}
