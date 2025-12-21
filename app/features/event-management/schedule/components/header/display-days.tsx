import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Text } from '~/design-system/typography.tsx';
import { formatDateRange } from '~/shared/datetimes/datetimes.ts';

const NEXT = 1;
const PREVIOUS = -1;

type Props = {
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  timezone: string;
  onChangeDisplayDays: (start: Date, end: Date) => void;
};

export function DisplayDays({ scheduleDays, displayedDays, timezone, onChangeDisplayDays }: Props) {
  const { t, i18n } = useTranslation();
  const scheduleStartDay = scheduleDays.at(0)!;
  const scheduleEndDay = scheduleDays.at(-1)!;
  const displayedStartDay = displayedDays.at(0)!;
  const displayedEndDay = displayedDays.at(-1)!;

  const handeDaysSelect = (start: Date | null, end: Date | null) => {
    if (!start || !end) return;
    onChangeDisplayDays(start, end);
  };

  const handleDaysChange = (direction: number) => {
    if (!displayedStartDay || !displayedEndDay) return;

    const startIndex = scheduleDays.findIndex((day) => isSameDay(day, displayedStartDay)) + direction;
    if (startIndex < 0) return;

    const endIndex = scheduleDays.findIndex((day) => isSameDay(day, displayedEndDay)) + direction;
    if (endIndex > scheduleDays.length - 1) return;

    onChangeDisplayDays(scheduleDays[startIndex], scheduleDays[endIndex]);
  };

  return (
    <div className="relative flex items-center rounded-md bg-white shadow-xs md:items-stretch">
      <button
        type="button"
        onClick={() => handleDaysChange(PREVIOUS)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-l-md border-gray-300 border-y border-l text-gray-400 focus:relative enabled:hover:bg-gray-50 enabled:hover:text-gray-500 disabled:cursor-not-allowed"
        disabled={isSameDay(scheduleStartDay, displayedStartDay)}
      >
        <span className="sr-only">{t('pagination.previous')}</span>
        <ChevronLeftIcon className="size-5 shrink-0" aria-hidden="true" />
      </button>

      <Popover>
        <PopoverButton className="hidden h-full cursor-pointer border-gray-300 border-y px-3.5 font-semibold text-gray-900 text-sm hover:bg-gray-50 focus:relative md:block">
          {formatDateRange(displayedStartDay, displayedEndDay, { format: 'medium', locale: i18n.language })}
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: 'bottom start', gap: '4px', offset: '-34px' }}
          className="z-30 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
        >
          <div className="flex items-center justify-between rounded-t-md border-b border-b-gray-200 bg-gray-50 px-4 py-2">
            <Text variant="secondary" weight="semibold">
              {t('event-management.schedule.actions.days')}
            </Text>
          </div>
          <div className="p-4 pt-2">
            <DateRangeInput
              start={{ name: 'start', label: t('common.start-date'), value: displayedStartDay }}
              end={{ name: 'end', label: t('common.end-date'), value: displayedEndDay }}
              min={scheduleStartDay}
              max={scheduleEndDay}
              timezone={timezone}
              onChange={handeDaysSelect}
            />
          </div>
        </PopoverPanel>
      </Popover>

      <button
        type="button"
        onClick={() => handleDaysChange(NEXT)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-r-md border-gray-300 border-y border-r text-gray-400 focus:relative enabled:hover:bg-gray-50 enabled:hover:text-gray-500 disabled:cursor-not-allowed"
        disabled={isSameDay(scheduleEndDay, displayedEndDay)}
      >
        <span className="sr-only">{t('pagination.next')}</span>
        <ChevronRightIcon className="size-5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}
