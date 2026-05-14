import type { Placement } from '@floating-ui/react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, formatDistance } from '~/shared/datetimes/datetimes.ts';
import { Tooltip } from '../tooltip.tsx';
import { ClientOnly } from './client-only.tsx';

type Props = { date: Date; className?: string; tooltip?: Placement };

export function TimeDistance({ date, className, tooltip }: Props) {
  const { i18n } = useTranslation();
  return (
    <ClientOnly>
      {() => (
        <Tooltip text={formatDatetime(date, { format: 'medium', locale: i18n.language })} placement={tooltip} hideArrow>
          <time dateTime={date.toISOString()} className={className}>
            {formatDistance(date, i18n.language)}
          </time>
        </Tooltip>
      )}
    </ClientOnly>
  );
}
