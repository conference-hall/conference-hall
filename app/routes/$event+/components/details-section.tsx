import { EnvelopeIcon, GlobeEuropeAfricaIcon, HeartIcon } from '@heroicons/react/20/solid';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Divider } from '~/design-system/divider.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import { formatConferenceDates, formatEventType } from '~/libs/formatters/cfp.ts';
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
  const hasDetails = websiteUrl || contactEmail || codeOfConductUrl;
  return (
    <Card as="section" p={8} className="space-y-8">
      <div className="space-y-2">
        <Text weight="semibold" size="base" mb={6}>
          {formatEventType(type)}
        </Text>

        {conferenceStart && conferenceEnd ? (
          <IconLabel icon={ClockIcon}>
            <ClientOnly>{() => formatConferenceDates(timezone, conferenceStart, conferenceEnd)}</ClientOnly>
          </IconLabel>
        ) : null}

        {location ? <IconLabel icon={MapPinIcon}>{location}</IconLabel> : null}

        {onlineEvent ? <IconLabel icon={MapPinIcon}>The event is online</IconLabel> : null}
      </div>

      <Divider />

      <Markdown>{description}</Markdown>

      <Divider />

      {hasDetails && (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-16">
          {websiteUrl && (
            <ExternalLink href={websiteUrl} iconLeft={GlobeEuropeAfricaIcon}>
              Website
            </ExternalLink>
          )}
          {contactEmail && (
            <ExternalLink href={`mailto:${contactEmail}`} iconLeft={EnvelopeIcon}>
              Contacts
            </ExternalLink>
          )}
          {codeOfConductUrl && (
            <ExternalLink href={codeOfConductUrl} iconLeft={HeartIcon}>
              Code of conduct
            </ExternalLink>
          )}
        </div>
      )}
    </Card>
  );
}
