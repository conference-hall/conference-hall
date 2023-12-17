import { Popover, RadioGroup } from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import { Form, useLocation, useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { Button, button, ButtonLink } from '~/design-system/Buttons';
import Select from '~/design-system/forms/Select';
import { Text } from '~/design-system/Typography';
import { useTeam } from '~/routes/team+/__components/useTeam';

import { useEvent } from '../useEvent';
import { reviewOptions, statusOptions } from './filters';

export function FiltersMenu() {
  return (
    <Popover className="sm:relative shrink-0">
      <Popover.Button className={button({ variant: 'secondary' })}>
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
        <span className="hidden sm:inline">Filters</span>
      </Popover.Button>
      <Popover.Overlay className="fixed inset-0 z-10 bg-black opacity-30 sm:hidden" />
      <Popover.Panel className="fixed bottom-0 w-full sm:absolute sm:bottom-auto sm:w-96 right-0 z-10 mt-2 origin-top-right sm:rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {({ close }) => <FiltersContent close={close} />}
      </Popover.Panel>
    </Popover>
  );
}

type FiltersContentProps = { close: () => void };

function FiltersContent({ close }: FiltersContentProps) {
  const { team } = useTeam();
  const location = useLocation();
  const [params] = useSearchParams();
  const { event } = useEvent();
  const { formats, categories } = event;

  const hasTracks = formats.length > 0 || categories.length > 0;

  return (
    <Form method="GET" onSubmit={close}>
      <div className="px-4 py-3 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
        <Text variant="secondary" weight="semibold">
          Filters
        </Text>
      </div>

      {params.get('query') && <input type="hidden" name="query" value={params.get('query')!} />}
      {params.get('sort') && <input type="hidden" name="sort" value={params.get('sort')!} />}

      <FiltersRadio
        label="Reviews"
        name="reviews"
        defaultValue={params.get('reviews')}
        options={reviewOptions}
        className="px-4 py-3"
      />

      {team.role !== 'REVIEWER' && (
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
                options={[{ id: null, name: 'All formats' }, ...formats]}
                srOnly
              />
            )}
            {categories.length > 0 && (
              <Select
                name="categories"
                label="Categories"
                defaultValue={params.get('categories')}
                options={[{ id: null, name: 'All categories' }, ...categories]}
                srOnly
              />
            )}
          </div>
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
    <RadioGroup name={name} defaultValue={defaultValue} className={className}>
      <RadioGroup.Label className="text-gray-600 text-sm font-medium">{label}</RadioGroup.Label>
      <div className="flex gap-2 flex-wrap mt-1">
        {options.map((option) => (
          <RadioGroup.Option
            key={option.name}
            value={option.value}
            className={({ checked }) =>
              cx('cursor-pointer', button({ variant: 'secondary', size: 's' }), {
                '!bg-indigo-100 ring-indigo-200 text-indigo-700 hover:bg-indigo-100': checked,
              })
            }
          >
            <RadioGroup.Label as="span">{option.name}</RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
