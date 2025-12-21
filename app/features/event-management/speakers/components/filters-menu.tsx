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
import { Button, buttonStyles } from '~/design-system/button.tsx';
import { Text } from '~/design-system/typography.tsx';

const speakerOptions = ['accepted', 'confirmed', 'declined'] as const;

export function FiltersMenu() {
  const { t } = useTranslation();
  return (
    <>
      {/* Desktop */}
      <Popover className="hidden sm:block">
        <PopoverButton as={Button} variant="secondary" iconLeft={AdjustmentsHorizontalIcon} block>
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
        <PopoverButton as={Button} variant="secondary" iconLeft={AdjustmentsHorizontalIcon} block>
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
  const location = useLocation();
  const [params] = useSearchParams();

  return (
    <Form method="GET" onSubmit={close}>
      <div className="rounded-t-md border-b border-b-gray-200 bg-gray-50 px-4 py-3">
        <Text variant="secondary" weight="semibold">
          {t('common.filters')}
        </Text>
      </div>

      {params.get('query') && <input type="hidden" name="query" value={params.get('query') || ''} />}

      <FiltersRadio
        label={t('event-management.speakers.filters.proposal-status')}
        name="proposalStatus"
        defaultValue={params.get('proposalStatus')}
        options={speakerOptions.map((value) => ({
          value,
          name: t(`common.proposals.status.${value}`),
        }))}
        className="px-4 py-3"
      />

      <div className="mt-2 flex justify-between border-t border-t-gray-200 px-4 py-3 sm:rounded-b-md">
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
      <Legend className="font-medium text-gray-600 text-sm">{label}</Legend>
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
