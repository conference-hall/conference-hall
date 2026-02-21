import { Description, Field, Fieldset, Label, Legend, Radio, RadioGroup } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { EVENT_TYPES } from '~/shared/constants.ts';
import type { EventType } from '~/shared/types/events.types.ts';

type Props = { selected: EventType; onSelect: (type: EventType) => void };

export function EventTypeRadioGroup({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <Fieldset>
      <Legend className="text-sm font-medium text-gray-900">{t('event-management.fields.type')}</Legend>

      <RadioGroup name="type" value={selected} onChange={onSelect}>
        <div className="mt-4 -space-y-px rounded-md bg-white">
          {EVENT_TYPES.map((type, index) => (
            <Field key={t(`common.event.type.label.${type}`)} className="relative">
              <Radio
                value={type}
                className={({ checked }) =>
                  cx(
                    index === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                    index === EVENT_TYPES.length - 1 ? 'rounded-br-md rounded-bl-md' : '',
                    checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                    'relative flex cursor-pointer border p-4 focus:outline-hidden',
                  )
                }
              >
                {({ focus, checked }) => (
                  <>
                    <span
                      className={cx(
                        checked ? 'border-transparent bg-indigo-600' : 'border-gray-300 bg-white',
                        focus ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                        'mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border',
                      )}
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <span className="ml-3 flex flex-col gap-2">
                      <Label className={cx(checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium')}>
                        {t(`common.event.type.label.${type}`)}
                      </Label>
                      <Description className={cx(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}>
                        {t(`common.event.type.description.${type}`)}
                      </Description>
                    </span>
                  </>
                )}
              </Radio>
            </Field>
          ))}
        </div>
      </RadioGroup>
    </Fieldset>
  );
}
