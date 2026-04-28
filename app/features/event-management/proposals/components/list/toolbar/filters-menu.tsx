import {
  Fieldset,
  Label,
  Legend,
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
  Radio,
  RadioGroup,
} from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useLocation, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button, buttonStyles } from '~/design-system/button.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';

const reviewStatusOptions = ['not-reviewed'] as const;

const markerValues = [
  'no-opinion',
  'negative',
  'neutral-1',
  'neutral-2',
  'neutral-3',
  'neutral-4',
  'neutral-5',
  'positive',
] as const;

type MarkerValue = (typeof markerValues)[number];

type MarkerOption = {
  value: MarkerValue;
  Icon: typeof StarIcon;
  fill: string;
  star?: number;
};

const markerOptions: MarkerOption[] = [
  { value: 'no-opinion', Icon: NoSymbolIcon, fill: 'fill-red-100' },
  { value: 'negative', Icon: XCircleIcon, fill: 'fill-gray-300' },
  { value: 'neutral-1', Icon: StarIcon, fill: 'fill-yellow-400', star: 1 },
  { value: 'neutral-2', Icon: StarIcon, fill: 'fill-yellow-400', star: 2 },
  { value: 'neutral-3', Icon: StarIcon, fill: 'fill-yellow-400', star: 3 },
  { value: 'neutral-4', Icon: StarIcon, fill: 'fill-yellow-400', star: 4 },
  { value: 'neutral-5', Icon: StarIcon, fill: 'fill-yellow-400', star: 5 },
  { value: 'positive', Icon: HeartIcon, fill: 'fill-red-400' },
];
const statusOptions = ['pending', 'accepted', 'rejected', 'archived'] as const;
const confirmationOptions = ['not-answered', 'confirmed', 'declined'] as const;

export function FiltersMenu() {
  const { t } = useTranslation();
  return (
    <>
      {/* Desktop */}
      <Popover className="hidden w-full sm:block">
        <PopoverButton as={Button} variant="secondary" block iconLeft={AdjustmentsHorizontalIcon}>
          {t('common.filters')}
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-10 w-96 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
        >
          {({ close }) => <FiltersContent close={close} />}
        </PopoverPanel>
      </Popover>

      {/* Mobile */}
      <Popover className="w-full sm:hidden">
        <PopoverButton as={Button} variant="secondary" block iconLeft={AdjustmentsHorizontalIcon}>
          {t('common.filters')}
        </PopoverButton>
        <PopoverBackdrop className="fixed inset-0 z-10 bg-slate-800/20" />
        <PopoverPanel
          className="fixed bottom-0 left-0 z-10 w-full bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
          modal
        >
          {({ close }) => <FiltersContent close={close} />}
        </PopoverPanel>
      </Popover>
    </>
  );
}

type FiltersContentProps = { close: VoidFunction };

function FiltersContent({ close }: FiltersContentProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const permissions = useUserTeamPermissions();

  const location = useLocation();
  const [params] = useSearchParams();

  const { formats, categories, tags } = event;
  const hasTracks = formats.length > 0 || categories.length > 0;

  return (
    <Form method="GET" onSubmit={close}>
      <div className="rounded-t-md border-b border-b-gray-200 bg-gray-50 px-4 py-3">
        <Text variant="secondary" weight="semibold">
          {t('common.filters')}
        </Text>
      </div>

      {params.get('query') && <input type="hidden" name="query" value={params.get('query') || ''} />}
      {params.get('sort') && <input type="hidden" name="sort" value={params.get('sort') || ''} />}

      <FiltersReviewMarkers defaultValue={params.get('reviews')} />

      {permissions.canChangeProposalStatus && (
        <>
          <FiltersRadio
            label={t('common.proposals.status')}
            name="status"
            defaultValue={params.get('status')}
            options={statusOptions.map((value) => ({ value, name: t(`common.proposals.status.${value}`) }))}
            className="px-4 py-2"
          />
          <FiltersRadio
            label={t('common.proposals.confirmation')}
            name="confirmation"
            defaultValue={params.get('confirmation')}
            options={confirmationOptions.map((value) => ({ value, name: t(`common.proposals.status.${value}.short`) }))}
            className="px-4 py-2"
          />
        </>
      )}

      {hasTracks && (
        <div className="space-y-1 px-4 py-2">
          <Text variant="secondary" weight="semibold" size="xs">
            {t('common.tracks')}
          </Text>
          <div className="space-y-1">
            {formats.length > 0 && (
              <Select
                name="formats"
                label={t('common.formats')}
                defaultValue={params.get('formats') || ''}
                options={[
                  { value: '', name: t('event-management.proposals.filters.formats.placeholder') },
                  ...formats.map((item) => ({ name: item.name, value: item.id })),
                ]}
                srOnly
              />
            )}
            {categories.length > 0 && (
              <Select
                name="categories"
                label={t('common.categories')}
                defaultValue={params.get('categories') || ''}
                options={[
                  { value: '', name: t('event-management.proposals.filters.categories') },
                  ...categories.map((item) => ({ name: item.name, value: item.id })),
                ]}
                srOnly
              />
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="space-y-1 px-4 py-2">
          <Text variant="secondary" weight="semibold" size="xs">
            {t('common.tags')}
          </Text>
          <Select
            name="tags"
            label={t('common.tags')}
            defaultValue={params.get('tags') || ''}
            options={[
              { value: '', name: t('event-management.proposals.filters.tags') },
              ...tags.map((item) => ({ name: item.name, value: item.id })),
            ]}
            srOnly
          />
        </div>
      )}
      <div className="mt-2 flex justify-between border-t border-t-gray-200 px-4 py-2 sm:rounded-b-md">
        <Button to={location.pathname} variant="secondary" onClick={close}>
          {t('common.reset')}
        </Button>
        <Button type="submit">{t('common.apply-now')}</Button>
      </div>
    </Form>
  );
}

type FiltersRadioProps = {
  label: string;
  name: string;
  defaultValue: string | null;
  options: Array<{ name: string; value: string }>;
  className?: string;
};

function FiltersRadio({ label, name, defaultValue, options, className }: FiltersRadioProps) {
  return (
    <Fieldset className={className}>
      <Text as={Legend} variant="secondary" weight="semibold" size="xs">
        {label}
      </Text>
      <RadioGroup name={name} defaultValue={defaultValue}>
        <div className="mt-1 flex flex-wrap gap-2">
          {options.map((option) => (
            <Radio
              key={option.name}
              value={option.value}
              className={({ checked }) =>
                cx('cursor-pointer', buttonStyles({ variant: 'secondary', size: 'sm' }), {
                  'bg-indigo-100! text-indigo-700 ring-indigo-200 hover:bg-indigo-100': checked,
                })
              }
            >
              <Label>{option.name}</Label>
            </Radio>
          ))}
        </div>
      </RadioGroup>
    </Fieldset>
  );
}

type FiltersReviewMarkersProps = { defaultValue: string | null };

function FiltersReviewMarkers({ defaultValue }: FiltersReviewMarkersProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(defaultValue);

  const isMarker = selected !== null && selected !== 'not-reviewed';

  const handleStatusChange = (value: string) => {
    setSelected(value);
  };

  const handleMarkerClick = (value: string) => {
    setSelected(selected === value ? null : value);
  };

  const isMarkerActive = (marker: MarkerOption): boolean => {
    if (!selected) return false;
    const selectedMarker = markerOptions.find((m) => m.value === selected);
    if (!selectedMarker) return false;
    if (marker.star && selectedMarker.star) return marker.star <= selectedMarker.star;
    if (marker.star && selected === 'positive') return true;
    return selected === marker.value;
  };

  return (
    <Fieldset className="px-4 py-2">
      <Text as={Legend} variant="secondary" weight="semibold" size="xs">
        {t('common.my-reviews')}
      </Text>
      <input type="hidden" name="reviews" value={selected ?? ''} />

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <div className="inline-flex">
          {markerOptions.map((marker, index) => {
            const active = isMarkerActive(marker);
            const isFirst = index === 0;
            const isLast = index === markerOptions.length - 1;
            return (
              <button
                key={marker.value}
                type="button"
                title={t(`common.review.status.${marker.value}`)}
                onClick={() => handleMarkerClick(marker.value)}
                className={cx(
                  'flex h-7 cursor-pointer items-center justify-center px-1.5 shadow-xs ring-1 ring-inset',
                  {
                    'rounded-l-md': isFirst,
                    'rounded-r-md': isLast,
                    '-ml-px': !isFirst,
                    'bg-indigo-100 ring-indigo-200': active,
                    'bg-white ring-gray-300 hover:bg-gray-50': !active,
                  },
                )}
              >
                <marker.Icon
                  className={cx('h-4 w-4', {
                    [marker.fill]: active,
                    'stroke-gray-600': !active,
                  })}
                />
              </button>
            );
          })}
        </div>

        <RadioGroup value={isMarker ? '' : (selected ?? '')} onChange={handleStatusChange} className="flex gap-2">
          {reviewStatusOptions.map((value) => (
            <Radio
              key={value}
              value={value}
              className={({ checked }) =>
                cx('cursor-pointer', buttonStyles({ variant: 'secondary', size: 'sm' }), {
                  'bg-indigo-100! text-indigo-700 ring-indigo-200 hover:bg-indigo-100': checked,
                })
              }
            >
              <Label>{t(`common.review.status.${value}`)}</Label>
            </Radio>
          ))}
        </RadioGroup>
      </div>
    </Fieldset>
  );
}
