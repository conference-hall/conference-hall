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
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Form, useLocation, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button, buttonStyles } from '~/design-system/button.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';

const reviewOptions = ['reviewed', 'not-reviewed', 'my-favorites'] as const;
const statusOptions = ['pending', 'accepted', 'rejected', 'not-answered', 'confirmed', 'declined'] as const;

export function FiltersMenu() {
  const { t } = useTranslation();
  return (
    <>
      {/* Desktop */}
      <Popover className="hidden sm:block w-full">
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
      <Popover className="sm:hidden w-full">
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
      <div className="px-4 py-3 bg-gray-50 border-b border-b-gray-200 rounded-t-md">
        <Text variant="secondary" weight="semibold">
          {t('common.filters')}
        </Text>
      </div>

      {params.get('query') && <input type="hidden" name="query" value={params.get('query') || ''} />}
      {params.get('sort') && <input type="hidden" name="sort" value={params.get('sort') || ''} />}

      <FiltersRadio
        label={t('common.reviews')}
        name="reviews"
        defaultValue={params.get('reviews')}
        options={reviewOptions.map((value) => ({
          value,
          name: t(`common.review.status.${value}`),
        }))}
        className="px-4 py-3"
      />

      {permissions.canChangeProposalStatus && (
        <FiltersRadio
          label={t('common.proposals')}
          name="status"
          defaultValue={params.get('status')}
          options={statusOptions.map((value) => ({
            value,
            name: t(`common.proposals.status.${value}`),
          }))}
          className="px-4 py-3"
        />
      )}

      {hasTracks && (
        <div className="px-4 py-3 space-y-2">
          <Text variant="secondary" weight="medium" size="s">
            {t('common.tracks')}
          </Text>
          <div className="space-y-2">
            {formats.length > 0 && (
              <Select
                name="formats"
                label={t('common.formats')}
                defaultValue={params.get('formats') || ''}
                options={[{ id: '', name: t('event-management.proposals.filters.formats.placeholder') }, ...formats]}
                srOnly
              />
            )}
            {categories.length > 0 && (
              <Select
                name="categories"
                label={t('common.categories')}
                defaultValue={params.get('categories') || ''}
                options={[{ id: '', name: t('event-management.proposals.filters.categories') }, ...categories]}
                srOnly
              />
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          <Text variant="secondary" weight="medium" size="s">
            {t('common.tags')}
          </Text>
          <Select
            name="tags"
            label={t('common.tags')}
            defaultValue={params.get('tags') || ''}
            options={[{ id: '', name: t('event-management.proposals.filters.tags') }, ...tags]}
            srOnly
          />
        </div>
      )}
      <div className="mt-2 px-4 py-3 sm:rounded-b-md border-t border-t-gray-200 flex justify-between">
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
      <Legend className="text-gray-600 text-sm font-medium">{label}</Legend>
      <RadioGroup name={name} defaultValue={defaultValue}>
        <div className="flex gap-2 flex-wrap mt-1">
          {options.map((option) => (
            <Radio
              key={option.name}
              value={option.value}
              className={({ checked }) =>
                cx('cursor-pointer', buttonStyles({ variant: 'secondary', size: 'sm' }), {
                  'bg-indigo-100! ring-indigo-200 text-indigo-700 hover:bg-indigo-100': checked,
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
