import { useTranslation } from 'react-i18next';
import { formatDatetime, formatDistance } from '~/shared/datetimes/datetimes.ts';
import { Tooltip } from '../tooltip.tsx';
import { ClientOnly } from './client-only.tsx';

type Props = { date: Date; className?: string };

export function TimeDistance({ date, className }: Props) {
  const { i18n } = useTranslation();
  return (
    <ClientOnly>
      {() => (
        <Tooltip text={formatDatetime(date, { format: 'medium', locale: i18n.language })}>
          <time dateTime={date.toISOString()} className={className}>
            {formatDistance(date, i18n.language)}
          </time>
        </Tooltip>
      )}
    </ClientOnly>
  );
}
