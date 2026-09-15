import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { Text } from '~/design-system/typography.tsx';
import { formatTime } from '~/shared/datetimes/datetimes.ts';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import { useSettings } from '../../store/schedule-store.ts';

export const DisplayTimes = memo(function DisplayTimes() {
  const { t, i18n } = useTranslation();

  const { displayedTimes } = useSettings();
  const { onChangeDisplayTimes } = useScheduleContext();

  const { start, end } = displayedTimes;

  const timeStart = formatTime(start, { format: 'short', locale: i18n.language });
  const timeEnd = formatTime(end, { format: 'short', locale: i18n.language });

  return (
    <Popover className="hidden sm:block">
      <PopoverButton as={Button} variant="secondary" iconLeft={ClockIcon}>
        {`${timeStart} ${t('common.to')} ${timeEnd}`}
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom start', gap: '4px' }}
        className="z-30 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
      >
        <div className="flex items-center justify-between rounded-t-md border-b border-b-gray-200 bg-gray-50 px-4 py-2">
          <Text variant="secondary" weight="semibold">
            {t('event-management.schedule.actions.times')}
          </Text>
        </div>
        <div className="p-4">
          <TimeRangeInput start={start} end={end} step={60} onChange={onChangeDisplayTimes} />
        </div>
      </PopoverPanel>
    </Popover>
  );
});
