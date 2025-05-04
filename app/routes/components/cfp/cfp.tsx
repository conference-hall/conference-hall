import { useTranslation } from 'react-i18next';
import { formatDatetime, formatDistance } from '~/libs/datetimes/datetimes.ts';
import { utcToTimezone } from '~/libs/datetimes/timezone.ts';
import type { CfpState } from '~/types/events.types.ts';

// todo(test)
const STATUSES = { OPENED: 'success', CLOSED: 'warning', FINISHED: 'error' } as const;

export function cfpColorStatus(cfpState: CfpState, cfpStart: Date | null, cfpEnd: Date | null) {
  if (!cfpStart && !cfpEnd) return 'disabled';
  return STATUSES[cfpState];
}

// todo(test)
type CallForPaperStatusLabelProps = { state: CfpState; start: Date | null; end: Date | null };

export function CallForPaperStatusLabel({ state, start, end }: CallForPaperStatusLabelProps) {
  const { t } = useTranslation();

  if (!start && !end) return t('common.cfp.disabled');

  switch (state) {
    case 'CLOSED':
      return t('common.cfp.status-label.CLOSED');
    case 'OPENED':
      return t('common.cfp.status-label.OPENED');
    case 'FINISHED':
      return t('common.cfp.status-label.FINISHED');
  }
}

// todo(test)
type CallForPaperElapsedTimeLabelProps = { state: CfpState; start: Date; end: Date };

export function CallForPaperElapsedTimeLabel({ state, start, end }: CallForPaperElapsedTimeLabelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  if (!start && !end) return t('common.cfp.disabled');

  switch (state) {
    case 'CLOSED':
      return t('common.cfp.elapsed-time-label.CLOSED', {
        date: formatDistance(start, locale, 'to'),
        interpolation: { escapeValue: false },
      });
    case 'OPENED':
      return t('common.cfp.elapsed-time-label.OPENED', {
        date: formatDistance(end, locale, 'to'),
        interpolation: { escapeValue: false },
      });
    case 'FINISHED':
      return t('common.cfp.elapsed-time-label.FINISHED');
  }
}

// todo(test)
type CallForPaperDateLabelProps = {
  state: CfpState;
  start: Date | null;
  end: Date | null;
  timezone: string;
  format?: 'short' | 'long';
};

export function CallForPaperDateLabel({ state, start, end, timezone, format }: CallForPaperDateLabelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  if (!start || !end) return null;

  const startDate = utcToTimezone(start, timezone);
  const endDate = utcToTimezone(end, timezone);
  const options = { format: format ?? 'long', locale, timezone };

  switch (state) {
    case 'CLOSED':
      return t('common.cfp.date-label.CLOSED', {
        date: formatDatetime(startDate, options),
        interpolation: { escapeValue: false },
      });
    case 'OPENED':
      return t('common.cfp.date-label.OPENED', {
        date: formatDatetime(endDate, options),
        interpolation: { escapeValue: false },
      });
    case 'FINISHED':
      return t('common.cfp.date-label.FINISHED', {
        date: formatDatetime(endDate, options),
        interpolation: { escapeValue: false },
      });
  }
}
