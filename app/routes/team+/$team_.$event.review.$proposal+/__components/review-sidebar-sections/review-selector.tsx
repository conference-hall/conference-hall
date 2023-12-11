import { RadioGroup } from '@headlessui/react';
import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useCallback, useState } from 'react';

import type { ReviewFeeling } from '~/types/proposals.types';

export type Option = {
  label: string;
  value: number | null;
  Icon: React.ComponentType<{ className?: string }>;
  feeling: ReviewFeeling;
  fill: string;
};

export const options: Array<Option> = [
  { label: 'No opinion', Icon: NoSymbolIcon, value: null, feeling: 'NO_OPINION', fill: 'fill-red-100' },
  { label: 'Nope, 0 star', Icon: XCircleIcon, value: 0, feeling: 'NEGATIVE', fill: 'fill-gray-300' },
  { label: '1 star', Icon: StarIcon, value: 1, feeling: 'NEUTRAL', fill: 'fill-yellow-400' },
  { label: '2 stars', Icon: StarIcon, value: 2, feeling: 'NEUTRAL', fill: 'fill-yellow-400' },
  { label: '3 stars', Icon: StarIcon, value: 3, feeling: 'NEUTRAL', fill: 'fill-yellow-400' },
  { label: '4 stars', Icon: StarIcon, value: 4, feeling: 'NEUTRAL', fill: 'fill-yellow-400' },
  { label: '5 stars', Icon: StarIcon, value: 5, feeling: 'NEUTRAL', fill: 'fill-yellow-400' },
  { label: 'Love it, 5 stars', Icon: HeartIcon, value: 5, feeling: 'POSITIVE', fill: 'fill-red-400' },
];

type StyleProps = { option: Option; index: number };

type Review = { note?: number | null; feeling?: string | null };

type Props = { value: Review; onChange: (feeling: ReviewFeeling, note: number | null) => void };

export function ReviewSelector({ value, onChange }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    options.findIndex((option) => option.value === value.note && option.feeling === value.feeling),
  );
  const [overIndex, setOverIndex] = useState<number>(-1);

  const iconStyles = useCallback(
    ({ option, index }: StyleProps) => {
      const currentSelected = isSelected(index, selectedIndex);
      const currentOver = isSelected(index, overIndex);
      return cx('h-8 w-8 stroke-gray-600', {
        'stroke-indigo-500': !currentSelected && currentOver,
        [option.fill]: currentSelected,
      });
    },
    [selectedIndex, overIndex],
  );

  const handleChange = (index: string) => {
    const selected = parseInt(index, 10);
    setSelectedIndex(selected);

    const option = options[selected];
    onChange(option.feeling, option.value);
  };

  return (
    <>
      <RadioGroup name="review" value={String(selectedIndex)} onChange={handleChange}>
        <RadioGroup.Label className="sr-only"> Choose a note</RadioGroup.Label>
        <div className="flex gap-2 items-center justify-between" onMouseOut={() => setOverIndex(-1)}>
          {options.map((option, index) => (
            <RadioGroup.Option key={index} value={String(index)} title={option.label}>
              <div className="cursor-pointer" onMouseOver={() => setOverIndex(index)}>
                <option.Icon className={iconStyles({ option, index })} />
                <RadioGroup.Label className="sr-only">{option.label}</RadioGroup.Label>
              </div>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </>
  );
}

function isSelected(currentIdx: number, selectedIdx?: number) {
  if (selectedIdx === undefined) return false;
  if (selectedIdx === 0 && currentIdx === selectedIdx) return true;
  if (selectedIdx === 1 && currentIdx === selectedIdx) return true;
  if (currentIdx > 1 && selectedIdx >= currentIdx) return true;
  return false;
}
