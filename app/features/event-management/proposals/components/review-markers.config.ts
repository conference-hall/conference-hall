import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { TFunction } from 'i18next';
import type { MarkerOption } from '~/design-system/forms/marker-group.tsx';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';

type MarkerValue =
  | 'no-opinion'
  | 'negative'
  | 'neutral-1'
  | 'neutral-2'
  | 'neutral-3'
  | 'neutral-4'
  | 'neutral-5'
  | 'positive';

type MarkerConfig = {
  value: MarkerValue;
  icon: MarkerOption['icon'];
  fill: string;
  cumulative?: boolean;
};

const markerConfigs: MarkerConfig[] = [
  { value: 'no-opinion', icon: NoSymbolIcon, fill: 'fill-red-100' },
  { value: 'negative', icon: XCircleIcon, fill: 'fill-gray-300' },
  { value: 'neutral-1', icon: StarIcon, fill: 'fill-yellow-400', cumulative: true },
  { value: 'neutral-2', icon: StarIcon, fill: 'fill-yellow-400', cumulative: true },
  { value: 'neutral-3', icon: StarIcon, fill: 'fill-yellow-400', cumulative: true },
  { value: 'neutral-4', icon: StarIcon, fill: 'fill-yellow-400', cumulative: true },
  { value: 'neutral-5', icon: StarIcon, fill: 'fill-yellow-400', cumulative: true },
  { value: 'positive', icon: HeartIcon, fill: 'fill-red-400' },
];

export function getReviewMarkerOptions(t: TFunction): MarkerOption[] {
  return markerConfigs.map((config) => ({
    value: config.value,
    icon: config.icon,
    fill: config.fill,
    label: t(`common.review.status.${config.value}`),
    cumulative: config.cumulative,
  }));
}

type ReviewData = { feeling: ReviewFeeling; note: number | null };

const reviewToMarker: Array<{ feeling: ReviewFeeling; note: number | null; marker: MarkerValue }> = [
  { feeling: 'NO_OPINION', note: null, marker: 'no-opinion' },
  { feeling: 'NEGATIVE', note: 0, marker: 'negative' },
  { feeling: 'NEUTRAL', note: 1, marker: 'neutral-1' },
  { feeling: 'NEUTRAL', note: 2, marker: 'neutral-2' },
  { feeling: 'NEUTRAL', note: 3, marker: 'neutral-3' },
  { feeling: 'NEUTRAL', note: 4, marker: 'neutral-4' },
  { feeling: 'NEUTRAL', note: 5, marker: 'neutral-5' },
  { feeling: 'POSITIVE', note: 5, marker: 'positive' },
];

export function markerToFeelingAndNote(marker: string): ReviewData {
  const match = reviewToMarker.find((r) => r.marker === marker);
  return match ? { feeling: match.feeling, note: match.note } : { feeling: 'NO_OPINION', note: null };
}

export function feelingAndNoteToMarker(feeling: ReviewFeeling | null, note: number | null): string | null {
  if (!feeling) return null;
  const match = reviewToMarker.find((r) => r.feeling === feeling && r.note === note);
  return match?.marker ?? null;
}
