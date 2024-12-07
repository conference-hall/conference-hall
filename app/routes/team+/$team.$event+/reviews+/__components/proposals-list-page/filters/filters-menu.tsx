import { Fieldset, Label, Legend, Popover, PopoverButton, PopoverPanel, Radio, RadioGroup } from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { Form, useLocation, useSearchParams } from 'react-router';

import { Button, ButtonLink, button } from '~/design-system/buttons.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Background } from '~/design-system/transitions.tsx';
import { Text } from '~/design-system/typography.tsx';

import { useCurrentEvent } from '~/routes/__components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/__components/contexts/team-context.tsx';
import { reviewOptions, statusOptions } from './filters.ts';

export function FiltersMenu() {
  return (
    <>
      {/* Desktop */}
      <Popover className="hidden sm:block">
        <PopoverButton className={button({ variant: 'secondary' })}>
          <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
          <span>Filters</span>
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-10 w-96 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {({ close }) => <FiltersContent close={close} />}
        </PopoverPanel>
      </Popover>

      {/* Mobile */}
      <Popover className="sm:hidden">
        <PopoverButton className={button({ variant: 'secondary' })}>
          <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
          <span>Filters</span>
        </PopoverButton>
        <Background />
        <PopoverPanel className="fixed bottom-0 left-0 z-10 w-full bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {({ close }) => <FiltersContent close={close} />}
        </PopoverPanel>
      </Popover>
    </>
  );
}

type FiltersContentProps = { close: () => void };

function FiltersContent({ close }: FiltersContentProps) {
  const currentTeam = useCurrentTeam();

  const location = useLocation();
  const [params] = useSearchParams();

  const { formats, categories, tags } = useCurrentEvent();
  const hasTracks = formats.length > 0 || categories.length > 0;

  return (
    <Form method="GET" onSubmit={close}>
      <div className="px-4 py-3 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
        <Text variant="secondary" weight="semibold">
          Filters
        </Text>
      </div>

      {params.get('query') && <input type="hidden" name="query" value={params.get('query') || ''} />}
      {params.get('sort') && <input type="hidden" name="sort" value={params.get('sort') || ''} />}

      <FiltersRadio
        label="Reviews"
        name="reviews"
        defaultValue={params.get('reviews')}
        options={reviewOptions}
        className="px-4 py-3"
      />

      {currentTeam.userPermissions.canDeliberateEventProposals && (
        <FiltersRadio
          label="Proposals"
          name="status"
          defaultValue={params.get('status')}
          options={statusOptions}
          className="px-4 py-3"
        />
      )}

      {hasTracks && (
        <div className="px-4 py-3 space-y-2">
          <Text variant="secondary" weight="medium" size="s">
            Tracks
          </Text>
          <div className="space-y-2">
            {formats.length > 0 && (
              <Select
                name="formats"
                label="Formats"
                defaultValue={params.get('formats')}
                options={[{ id: null, name: 'Select a format...' }, ...formats]}
                srOnly
              />
            )}
            {categories.length > 0 && (
              <Select
                name="categories"
                label="Categories"
                defaultValue={params.get('categories')}
                options={[{ id: null, name: 'Select a category...' }, ...categories]}
                srOnly
              />
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          <Text variant="secondary" weight="medium" size="s">
            Tags
          </Text>
          <Select
            name="tags"
            label="Tags"
            defaultValue={params.get('tags')}
            options={[{ id: null, name: 'Select a tag...' }, ...tags]}
            srOnly
          />
        </div>
      )}
      <div className="mt-2 px-4 py-3 sm:rounded-b-md border-t border-t-gray-200 flex justify-between">
        <ButtonLink to={location.pathname} variant="secondary" onClick={close}>
          Reset
        </ButtonLink>
        <Button type="submit">Apply now</Button>
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
      <Legend className="text-gray-600 text-sm font-medium">{label}</Legend>
      <RadioGroup name={name} defaultValue={defaultValue}>
        <div className="flex gap-2 flex-wrap mt-1">
          {options.map((option) => (
            <Radio
              key={option.name}
              value={option.value}
              className={({ checked }) =>
                cx('cursor-pointer', button({ variant: 'secondary', size: 's' }), {
                  '!bg-indigo-100 ring-indigo-200 text-indigo-700 hover:bg-indigo-100': checked,
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
