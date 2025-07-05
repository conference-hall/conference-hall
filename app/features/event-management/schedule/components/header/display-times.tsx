import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { formatTime } from '~/shared/datetimes/datetimes.ts';
import { button } from '~/shared/design-system/buttons.tsx';
import { TimeRangeInput } from '~/shared/design-system/forms/time-range-input.tsx';
import { Text } from '~/shared/design-system/typography.tsx';

type Props = {
  displayedTimes: { start: number; end: number };
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function DisplayTimes({ displayedTimes, onChangeDisplayTime }: Props) {
  const { t, i18n } = useTranslation();
  const { start, end } = displayedTimes;

  const timeStart = formatTime(start, { format: 'short', locale: i18n.language });
  const timeEnd = formatTime(end, { format: 'short', locale: i18n.language });

  return (
    <Popover className="hidden sm:block">
      <PopoverButton className={button({ variant: 'secondary' })}>
        <ClockIcon className="h-4 w-4 text-gray-500" />
        <span> {`${timeStart} to ${timeEnd}`}</span>
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom start', gap: '4px' }}
        className="z-30 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
          <Text variant="secondary" weight="semibold">
            {t('event-management.schedule.actions.times')}
          </Text>
        </div>
        <div className="p-4">
          <TimeRangeInput start={start} end={end} step={60} onChange={onChangeDisplayTime} />
        </div>
      </PopoverPanel>
    </Popover>
  );
}
