import c from 'classnames';
import { RadioGroup } from '@headlessui/react';
import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/Typography';
import { useCallback, useState } from 'react';

type Option = {
  label: string;
  value: number | null;
  Icon: React.ComponentType<{ className?: string }>;
  feeling: string;
  fill: string;
};

const options: Array<Option> = [
  { label: 'No opinion', Icon: NoSymbolIcon, value: null, feeling: 'NO_OPINION', fill: 'fill-red-200' },
  { label: 'Nope, 0 star', Icon: XCircleIcon, value: 0, feeling: 'NEGATIVE', fill: 'fill-gray-400' },
  { label: '1 star', Icon: StarIcon, value: 1, feeling: 'NEUTRAL', fill: 'fill-yellow-200' },
  { label: '2 stars', Icon: StarIcon, value: 2, feeling: 'NEUTRAL', fill: 'fill-yellow-200' },
  { label: '3 stars', Icon: StarIcon, value: 3, feeling: 'NEUTRAL', fill: 'fill-yellow-200' },
  { label: '4 stars', Icon: StarIcon, value: 4, feeling: 'NEUTRAL', fill: 'fill-yellow-200' },
  { label: '5 stars', Icon: StarIcon, value: 5, feeling: 'NEUTRAL', fill: 'fill-yellow-200' },
  { label: 'Love it, 5 stars', Icon: HeartIcon, value: 5, feeling: 'POSITIVE', fill: 'fill-red-200' },
];

type StyleProps = { option: Option; index: number };

export function RatingButtons() {
  const [selected, setSelected] = useState<Option>();
  const [over, setOver] = useState<Option>();

  const iconStyles = useCallback(
    ({ option, index }: StyleProps) => {
      const currentSelected = isSelected(index, selected);
      const currentOver = isSelected(index, over);
      return c('h-8 w-8 sm:h-10 sm:w-10', {
        'stroke-indigo-500': !currentSelected && currentOver,
        [option.fill]: currentSelected,
      });
    },
    [selected, over]
  );

  return (
    <div className="text-center font-medium">
      <RadioGroup value={selected} onChange={setSelected}>
        <RadioGroup.Label className="sr-only"> Choose a rating value </RadioGroup.Label>
        <div className="flex items-center" onMouseOut={() => setOver(undefined)}>
          {options.map((option, index) => (
            <RadioGroup.Option key={index} value={option}>
              <div className="cursor-pointer px-1 sm:px-3" onMouseOver={() => setOver(option)}>
                <option.Icon className={iconStyles({ option, index })} />
                <RadioGroup.Label className="sr-only">{option.label}</RadioGroup.Label>
              </div>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      <Text size="m" variant="secondary" className="mt-2 hidden sm:block">
        {over?.label ?? selected?.label ?? 'Not rated yet!'}
      </Text>
    </div>
  );
}

function isSelected(currentIdx: number, selected?: Option) {
  const selectedIdx = options.findIndex((o) => o === selected);
  if (selectedIdx === undefined) return false;
  if (selectedIdx === 0 && currentIdx === selectedIdx) return true;
  if (selectedIdx === 1 && currentIdx === selectedIdx) return true;
  if (currentIdx > 1 && selectedIdx >= currentIdx) return true;
  return false;
}
