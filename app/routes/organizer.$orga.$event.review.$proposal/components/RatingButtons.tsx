import c from 'classnames';
import { useCallback, useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/Typography';
import { useFetcher, useNavigation, useParams } from '@remix-run/react';

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

type Rating = { rating?: number | null; feeling?: string | null };

type Props = { userRating: Rating };

export function RatingButtons({ userRating }: Props) {
  const params = useParams();
  const fetcher = useFetcher();
  const submission = useNavigation();
  const defaultIndex = findRatingOptionIndex(userRating, submission?.formData);
  const [overIndex, setOverIndex] = useState<number>(-1);

  const action = `/organizer/${params.orga}/${params.event}/review/${params.proposal}/rate`;

  const iconStyles = useCallback(
    ({ option, index }: StyleProps) => {
      const currentSelected = isSelected(index, defaultIndex);
      const currentOver = isSelected(index, overIndex);
      return c('h-8 w-8 sm:h-10 sm:w-10', {
        'stroke-indigo-500': !currentSelected && currentOver,
        [option.fill]: currentSelected,
      });
    },
    [defaultIndex, overIndex]
  );

  const handleSubmit = useCallback(
    (index: string) => {
      const option = options[parseInt(index, 10)];
      if (!option) return;
      fetcher.submit(
        { rating: option.value === null ? '' : String(option.value), feeling: option.feeling },
        { action, method: 'POST' }
      );
    },
    [fetcher, action]
  );

  return (
    <fetcher.Form className="text-center font-medium">
      <RadioGroup value={String(defaultIndex)} onChange={handleSubmit}>
        <RadioGroup.Label className="sr-only"> Choose a rating value </RadioGroup.Label>
        <div className="flex items-center" onMouseOut={() => setOverIndex(-1)}>
          {options.map((option, index) => (
            <RadioGroup.Option key={index} value={String(index)}>
              <div className="cursor-pointer px-1 sm:px-3" onMouseOver={() => setOverIndex(index)}>
                <option.Icon className={iconStyles({ option, index })} />
                <RadioGroup.Label className="sr-only">{option.label}</RadioGroup.Label>
              </div>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      <Text size="base" variant="secondary">
        {options[overIndex]?.label ?? options[defaultIndex]?.label ?? 'Not rated yet!'}
      </Text>
    </fetcher.Form>
  );
}

function isSelected(currentIdx: number, selectedIdx?: number) {
  if (selectedIdx === undefined) return false;
  if (selectedIdx === 0 && currentIdx === selectedIdx) return true;
  if (selectedIdx === 1 && currentIdx === selectedIdx) return true;
  if (currentIdx > 1 && selectedIdx >= currentIdx) return true;
  return false;
}

function findRatingOptionIndex(userRating: Rating, submissionData?: FormData) {
  let ratings = userRating;
  // optimistic ui
  if (submissionData) {
    const rating = String(submissionData.get('rating'));
    const feeling = String(submissionData.get('feeling'));
    ratings = { rating: rating !== '' ? parseInt(rating, 10) : null, feeling };
  }
  return options.findIndex((option) => option.value === ratings.rating && option.feeling === ratings.feeling);
}

export function findRatingOption(userRating: Rating) {
  const optionIndex = findRatingOptionIndex(userRating);
  return options[optionIndex];
}
