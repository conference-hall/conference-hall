import { LockClosedIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import { SpeakerLinks } from '~/features/speaker/talk-library/components/speakers.tsx';

type Props = {
  email: string;
  bio: string | null;
  location: string | null;
  socialLinks: Array<string>;
};

export function SpeakerDetailsSection({ email, bio, location, socialLinks }: Props) {
  const { t } = useTranslation();

  return (
    <div className="hidden sm:block space-y-6">
      <Card className="divide-y divide-gray-200">
        <div className="p-6">
          {bio ? (
            <Markdown className="line-clamp-5">{bio}</Markdown>
          ) : (
            <Text variant="secondary">{t('speaker.activity.no-profile')}</Text>
          )}
        </div>

        <div className="px-6 py-4">
          <SpeakerLinks speaker={{ location, email, socialLinks }} />
        </div>

        <div className="px-6 py-4 flex items-center gap-3">
          <IconLabel icon={LockClosedIcon}>{t('speaker.activity.visibility')}</IconLabel>
        </div>

        <div className="p-4">
          <ButtonLink to={href('/speaker/settings/profile')} variant="secondary" iconLeft={PencilSquareIcon} block>
            {t('speaker.activity.edit-profile')}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
