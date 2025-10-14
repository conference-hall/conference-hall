import { useTranslation } from 'react-i18next';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import { ClientOnly } from './client-only.tsx';

type Props = { date: Date; className?: string };

export function TimeDistance({ date, className }: Props) {
  const { i18n } = useTranslation();
  return (
    <ClientOnly>
      {() => (
        <time dateTime={date.toISOString()} className={className}>
          {formatDistance(date, i18n.language)}
        </time>
      )}
    </ClientOnly>
  );
}
