import { GlobeAltIcon, HeartIcon, HomeIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/Card';
import { IconLabel } from '~/design-system/IconLabel';
import { Markdown } from '~/design-system/Markdown';
import { H3 } from '~/design-system/Typography';

type Props = {
  name: string | null;
  bio: string | null;
  address: string | null;
  company: string | null;
  twitter: string | null;
  github: string | null;
};

export function SpeakerDetailsSection({ name, bio, address, company, twitter, github }: Props) {
  const displayInfo = address || company || twitter || github;

  return (
    <Card as="section" rounded="2xl" p={8} className="space-y-6">
      <H3 mb={0}>{name}'s profile</H3>
      {bio && <Markdown className="line-clamp-5" source={bio} />}
      {displayInfo && (
        <div className="space-y-4">
          {address && <IconLabel icon={MapPinIcon}>{address}</IconLabel>}
          {company && <IconLabel icon={HomeIcon}>{company}</IconLabel>}
          {twitter && <IconLabel icon={HeartIcon}>{twitter}</IconLabel>}
          {github && <IconLabel icon={GlobeAltIcon}>{github}</IconLabel>}
        </div>
      )}
      <ButtonLink to="profile" variant="secondary" block>
        Edit your profile
      </ButtonLink>
    </Card>
  );
}
