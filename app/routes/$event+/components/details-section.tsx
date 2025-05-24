import { EnvelopeIcon, GlobeEuropeAfricaIcon, HeartIcon } from '@heroicons/react/20/solid';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Divider } from '~/design-system/divider.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import { formatDate, formatDay } from '~/libs/datetimes/datetimes.ts';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';

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
            <ClientOnly>{() => formatConferenceDates(conferenceStart, conferenceEnd, timezone, locale)}</ClientOnly>
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

function formatConferenceDates(start: Date, end: Date, timezone: string, locale: string) {
  if (isSameDay(start, end)) {
    return formatDate(start, { format: 'long', locale, timezone });
  }
  const startFormatted = formatDay(start, { format: 'medium', locale, timezone });
  const endFormatted = formatDate(end, { format: 'long', locale, timezone });
  return [startFormatted, endFormatted].join(' - ');
}
