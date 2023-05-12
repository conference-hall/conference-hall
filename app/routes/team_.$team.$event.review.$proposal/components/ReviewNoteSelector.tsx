import c from 'classnames';
import { useCallback, useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { RatingFeeling } from '@prisma/client';

export type Option = {
  label: string;
  value: number | null;
  Icon: React.ComponentType<{ className?: string }>;
  feeling: RatingFeeling;
  fill: string;
};

export const options: Array<Option> = [
  { label: 'No opinion', Icon: NoSymbolIcon, value: null, feeling: 'NO_OPINION', fill: 'fill-red-100' },
  { label: 'Nope, 0 star', Icon: XCircleIcon, value: 0, feeling: 'NEGATIVE', fill: 'fill-gray-300' },
  { label: '1 star', Icon: StarIcon, value: 1, feeling: 'NEUTRAL', fill: 'fill-yellow-300' },
  { label: '2 stars', Icon: StarIcon, value: 2, feeling: 'NEUTRAL', fill: 'fill-yellow-300' },
  { label: '3 stars', Icon: StarIcon, value: 3, feeling: 'NEUTRAL', fill: 'fill-yellow-300' },
  { label: '4 stars', Icon: StarIcon, value: 4, feeling: 'NEUTRAL', fill: 'fill-yellow-300' },
  { label: '5 stars', Icon: StarIcon, value: 5, feeling: 'NEUTRAL', fill: 'fill-yellow-300' },
  { label: 'Love it, 5 stars', Icon: HeartIcon, value: 5, feeling: 'POSITIVE', fill: 'fill-red-300' },
];

type StyleProps = { option: Option; index: number };

type Review = { rating?: number | null; feeling?: string | null };

type Props = { value: Review; onChange: (index: number) => void };

export function ReviewNoteSelector({ value, onChange }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    options.findIndex((option) => option.value === value.rating && option.feeling === value.feeling)
  );
  const [overIndex, setOverIndex] = useState<number>(-1);

  const iconStyles = useCallback(
    ({ option, index }: StyleProps) => {
      const currentSelected = isSelected(index, selectedIndex);
      const currentOver = isSelected(index, overIndex);
      return c('h-8 w-8 stroke-gray-600', {
        'stroke-indigo-500': !currentSelected && currentOver,
        [option.fill]: currentSelected,
      });
    },
    [selectedIndex, overIndex]
  );

  const handleChange = (index: string) => {
    setSelectedIndex(parseInt(index, 10));
    onChange(parseInt(index, 10));
  };

  return (
    <>
      <RadioGroup name="review" value={String(selectedIndex)} onChange={handleChange}>
        <RadioGroup.Label className="sr-only"> Choose a rating value </RadioGroup.Label>
        <div className="flex items-center justify-between" onMouseOut={() => setOverIndex(-1)}>
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
