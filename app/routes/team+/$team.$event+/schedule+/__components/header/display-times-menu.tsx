import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { endOfHour, format, getHours, setHours, startOfDay, startOfHour } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { Button, button } from '~/design-system/buttons.tsx';
import SelectNative from '~/design-system/forms/select-native.tsx';
import { Text } from '~/design-system/typography.tsx';

import { formatTime } from '../schedule/timeslots.ts';

type Props = {
  startTime: Date;
  endTime: Date;
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function DisplayTimesMenu({ startTime, endTime, onChangeDisplayTime }: Props) {
  const [start, setStart] = useState(getHours(startTime));
  const [end, setEnd] = useState(getHours(endTime));

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const hour = Number(event.target.value);
    if (event.target.name === 'start') setStart(hour);
    if (event.target.name === 'end') setEnd(hour);
  };

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
            <div className="px-4 py-3 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
              <Text variant="secondary" weight="semibold">
                Display times
              </Text>
            </div>
            <div className="flex items-center gap-2 p-4">
              <SelectNative
                name="start"
                label="From"
                value={start}
                options={START_HOURS_OPTIONS.filter((o) => Number(o.value) <= end)}
                onChange={handleSelectChange}
                inline
              />

              <SelectNative
                name="end"
                label="To"
                value={end}
                options={END_HOURS_OPTIONS.filter((o) => Number(o.value) >= start)}
                onChange={handleSelectChange}
                inline
              />

              <Button
                onClick={() => {
                  onChangeDisplayTime(start, end);
                  close();
                }}
              >
                Apply
              </Button>
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}

const START_HOURS_OPTIONS = Array(24)
  .fill(0)
  .map((_, index) => ({
    name: formatHour(index),
    value: String(index),
  }));

const END_HOURS_OPTIONS = Array(24)
  .fill(0)
  .map((_, index) => ({
    name: formatHour(index, { endOfDay: true }),
    value: String(index),
  }));

function formatHour(hour: number, options: { endOfDay?: boolean } = {}): string {
  if (hour < 0 || hour > 23) throw new Error('Hour must be between 0 and 23');

  const date = setHours(startOfDay(new Date()), hour);
  if (options.endOfDay) {
    return format(endOfHour(date), 'HH:mm');
  }
  return format(startOfHour(date), 'HH:mm');
}
