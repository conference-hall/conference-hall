import { LinkIcon, LockClosedIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  email: string | null;
  picture: string | null;
  bio: string | null;
  location: string | null;
  socialLinks: Array<string>;
};

export function SpeakerDetailsSection({ bio, location, socialLinks }: Props) {
  const displayInfo = location || socialLinks.length > 0;

  return (
    <div className="hidden sm:block space-y-6">
      <Card className="divide-y divide-gray-200">
        <div className="p-6">
          {bio ? <Markdown className="line-clamp-5">{bio}</Markdown> : <Text variant="secondary">(No profile)</Text>}
        </div>

        {displayInfo && (
          <div className="p-6 space-y-4">
            {location && <IconLabel icon={MapPinIcon}>{location}</IconLabel>}
            {socialLinks.map((socialLink) => (
              <IconLabel key={socialLink} icon={LinkIcon}>
                {socialLink}
              </IconLabel>
            ))}
          </div>
        )}

        <div className="px-6 py-4 flex items-center gap-3">
          <LockClosedIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-400" />
          <Text weight="medium" variant="secondary">
            Your speaker activity is private.
          </Text>
        </div>

        <div className="p-4">
          <ButtonLink to="profile" variant="secondary" iconLeft={PencilSquareIcon} block>
            Edit your profile
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
