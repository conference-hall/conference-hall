import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { differenceInMinutes, startOfDay } from 'date-fns';

import { button } from '~/design-system/buttons.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { IconButton } from '~/design-system/icon-buttons.tsx';
import { Text } from '~/design-system/typography.tsx';

import { formatTime } from '../schedule/timeslots.ts';

type Props = {
  startTime: Date;
  endTime: Date;
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function DisplayTimesMenu({ startTime, endTime, onChangeDisplayTime }: Props) {
  return (
    <Popover className="hidden sm:block">
      <PopoverButton className={button({ variant: 'secondary' })}>
        <ClockIcon className="h-4 w-4 text-gray-500" />
        <span> {`${formatTime(startTime)} to ${formatTime(endTime)}`}</span>
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom end', gap: '8px' }}
        className="z-30 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        {({ close }) => (
          <>
            <div className="flex items-center justify-between pl-4 pr-2 py-1 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
              <Text variant="secondary" weight="semibold">
                Display times
              </Text>
              <IconButton icon={XMarkIcon} label="Close" onClick={() => close()} variant="secondary" />
            </div>
            <div className="p-4">
              <TimeRangeInput
                startTime={getMinutesFromStartOfDay(startTime)}
                endTime={getMinutesFromStartOfDay(endTime)}
                step={60}
                onChange={onChangeDisplayTime}
              />
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}

// TODO: extract
function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}
