import { BuildingOfficeIcon, LockClosedIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { href } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { SocialLink } from '~/design-system/social-link.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  bio: string | null;
  company: string | null;
  location: string | null;
  socialLinks: Array<string>;
};

export function SpeakerDetailsSection({ bio, company, location, socialLinks }: Props) {
  const displayInfo = location || company || socialLinks.length > 0;

  return (
    <div className="hidden sm:block space-y-6">
      <Card className="divide-y divide-gray-200">
        <div className="p-6">
          {bio ? <Markdown className="line-clamp-5">{bio}</Markdown> : <Text variant="secondary">(No profile)</Text>}
        </div>

        {displayInfo && (
          <div className="p-6 flex flex-col gap-2">
            {company && <IconLabel icon={BuildingOfficeIcon}>{company}</IconLabel>}
            {location && <IconLabel icon={MapPinIcon}>{location}</IconLabel>}
            {socialLinks.map((socialLink) => (
              <SocialLink key={socialLink} url={socialLink} />
            ))}
          </div>
        )}

        <div className="px-6 py-4 flex items-center gap-3">
          <IconLabel icon={LockClosedIcon}>Your speaker activity is private.</IconLabel>
        </div>

        <div className="p-4">
          <ButtonLink to={href('/speaker/settings/profile')} variant="secondary" iconLeft={PencilSquareIcon} block>
            Edit your profile
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
