import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { format, isSameDay } from 'date-fns';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Text } from '~/design-system/typography.tsx';

const NEXT = 1;
const PREVIOUS = -1;

type Props = {
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  onChangeDisplayDays: (start: Date, end: Date) => void;
};

export function DisplayDays({ scheduleDays, displayedDays, onChangeDisplayDays }: Props) {
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
        className="flex size-9 items-center justify-center rounded-l-md border-y border-l border-gray-300 text-gray-400 enabled:hover:text-gray-500 focus:relative enabled:hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
        disabled={isSameDay(scheduleStartDay, displayedStartDay)}
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon className="size-5 shrink-0" aria-hidden="true" />
      </button>

      <Popover>
        <PopoverButton className="hidden h-full border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 cursor-pointer focus:relative md:block">
          {formatDays(displayedStartDay, displayedEndDay)}
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: 'bottom start', gap: '4px', offset: '-34px' }}
          className="z-30 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
            <Text variant="secondary" weight="semibold">
              Display days
            </Text>
          </div>
          <div className="p-4 pt-2">
            <DateRangeInput
              start={{ name: 'start', label: 'Start date', value: displayedStartDay }}
              end={{ name: 'end', label: 'End date', value: displayedEndDay }}
              min={scheduleStartDay}
              max={scheduleEndDay}
              timezone="Europe/Paris"
              onChange={handeDaysSelect}
            />
          </div>
        </PopoverPanel>
      </Popover>

      <button
        type="button"
        onClick={() => handleDaysChange(NEXT)}
        className="flex size-9 items-center justify-center rounded-r-md border-y border-r border-gray-300 text-gray-400 enabled:hover:text-gray-500 focus:relative enabled:hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
        disabled={isSameDay(scheduleEndDay, displayedEndDay)}
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon className="size-5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}

function formatDays(start: Date, end: Date) {
  if (!start) return null;
  if (start === end) return format(start, 'PPP');
  return `${format(start, 'MMM d')} to ${format(end, 'PP')}`;
}
