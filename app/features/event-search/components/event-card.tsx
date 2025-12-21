import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Avatar } from '~/design-system/avatar.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Card, CardLink } from '~/design-system/layouts/card.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import type { CfpState } from '~/shared/types/events.types.ts';
import { CallForPaperStatusLabel, cfpColorStatus } from '../../event-participation/event-page/components/cfp.tsx';

type CardContentProps = {
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  logoUrl: string | null;
  cfpState: CfpState;
  cfpStart: Date | null;
  cfpEnd: Date | null;
};

type EventCardLinkProps = { to: string } & CardContentProps;

export function EventCardLink({ to, ...rest }: EventCardLinkProps) {
  return (
    <CardLink as="li" to={to}>
      <CardContent {...rest} />
    </CardLink>
  );
}

export function EventCard(props: CardContentProps) {
  return (
    <Card>
      <CardContent {...props} />
    </Card>
  );
}

function CardContent({ name, type, logoUrl, cfpState, cfpStart, cfpEnd }: CardContentProps) {
  const { t } = useTranslation();

  return (
    <span className="flex h-20 justify-between lg:h-32">
      {/* Desktop */}
      <Avatar picture={logoUrl} name={name} size="4xl" square className="hidden rounded-r-none lg:flex" />
      {/* Mobile */}
      <Avatar picture={logoUrl} name={name} size="2xl" square className="rounded-r-none lg:hidden" />

      <div className="flex flex-1 flex-col justify-between overflow-hidden px-4 py-2 lg:p-4">
        <Text size="base" weight="semibold" className="lg:text-lg" truncate>
          {name}
        </Text>
        <div className="flex flex-1 items-end justify-between truncate sm:flex-row-reverse lg:flex-col lg:items-start">
          <Subtitle weight="medium" className="hidden sm:block">
            {t(`common.event.type.label.${type}`)}
          </Subtitle>
          <CfpStatus cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />
        </div>
      </div>
    </span>
  );
}

type CfpStatusProps = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; className?: string };

function CfpStatus({ cfpState, cfpStart, cfpEnd, className }: CfpStatusProps) {
  return (
    <div className={cx('flex items-center space-x-2 truncate', className)}>
      <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
      <ClientOnly>
        {() => (
          <Text variant="secondary" weight="medium" truncate>
            <CallForPaperStatusLabel state={cfpState} start={cfpStart} end={cfpEnd} />
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
