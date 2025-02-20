import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  onChangeDisplayDays: (start: Date, end: Date) => void;
};

export function DisplayDays({ scheduleDays, displayedDays, onChangeDisplayDays }: Props) {
  const scheduleStartDay = scheduleDays.at(0);
  const scheduleEndDay = scheduleDays.at(-1);
  const displayedStartDay = displayedDays.at(0);
  const displayedEndDay = displayedDays.at(-1);

  const handeDaysChange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return;
    onChangeDisplayDays(start, end);
  };

  if (!displayedStartDay || !displayedEndDay) return null;

  const title = displayedStartDay ? format(displayedStartDay, 'PPPP') : 'Out of schedule';

  return (
    <div className="relative flex items-center rounded-md bg-white shadow-xs md:items-stretch">
      <button
        type="button"
        className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50 cursor-pointer"
      >
        <span className="sr-only">Next month</span>
        <ChevronLeftIcon className="size-5 shrink-0" aria-hidden="true" />
      </button>
      <Popover>
        <PopoverButton className="hidden h-full border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 cursor-pointer focus:relative md:block">
          {title}
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
              onChange={handeDaysChange}
            />
          </div>
        </PopoverPanel>
      </Popover>

      <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
      <button
        type="button"
        className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50 cursor-pointer"
      >
        <span className="sr-only">Next month</span>
        <ChevronRightIcon className="size-5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}
