import { EnvelopeIcon, GlobeEuropeAfricaIcon, HeartIcon } from '@heroicons/react/20/solid';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { formatDateRange } from '~/libs/datetimes/datetimes.ts';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';
import { Divider } from '~/shared/design-system/divider.tsx';
import { IconLabel } from '~/shared/design-system/icon-label.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { ExternalLink } from '~/shared/design-system/links.tsx';
import { Markdown } from '~/shared/design-system/markdown.tsx';
import { Text } from '~/shared/design-system/typography.tsx';

type Props = {
  description: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  codeOfConductUrl: string | null;
  conferenceStart: Date | null;
  conferenceEnd: Date | null;
  onlineEvent: boolean;
  location: string | null;
  type: 'CONFERENCE' | 'MEETUP';
  timezone: string;
  className?: string;
};

export function DetailsSection({
  description,
  websiteUrl,
  contactEmail,
  codeOfConductUrl,
  conferenceStart,
  conferenceEnd,
  onlineEvent,
  location,
  type,
  timezone,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const hasDetails = websiteUrl || contactEmail || codeOfConductUrl;

  return (
    <Card as="section" p={8} className="space-y-8">
      <div className="space-y-2">
        <Text weight="semibold" size="base" mb={6}>
          {t(`common.event.type.label.${type}`)}
        </Text>

        {conferenceStart && conferenceEnd ? (
          <IconLabel icon={ClockIcon}>
            <ClientOnly>
              {() => formatDateRange(conferenceStart, conferenceEnd, { format: 'long', locale, timezone })}
            </ClientOnly>
          </IconLabel>
        ) : null}

        {location ? <IconLabel icon={MapPinIcon}>{location}</IconLabel> : null}

        {onlineEvent ? <IconLabel icon={MapPinIcon}>{t('event.page.online')}</IconLabel> : null}
      </div>

      <Divider />

      <Markdown>{description}</Markdown>

      <Divider />

      {hasDetails && (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-16">
          {websiteUrl && (
            <ExternalLink href={websiteUrl} iconLeft={GlobeEuropeAfricaIcon}>
              {t('event.page.website')}
            </ExternalLink>
          )}
          {contactEmail && (
            <ExternalLink href={`mailto:${contactEmail}`} iconLeft={EnvelopeIcon}>
              {t('event.page.contacts')}
            </ExternalLink>
          )}
          {codeOfConductUrl && (
            <ExternalLink href={codeOfConductUrl} iconLeft={HeartIcon}>
              {t('event.page.code-of-conduct')}
            </ExternalLink>
          )}
        </div>
      )}
    </Card>
  );
}
