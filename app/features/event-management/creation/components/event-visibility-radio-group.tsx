import { Description, Field, Fieldset, Label, Legend, Radio, RadioGroup } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EVENT_VISIBILITY } from '~/shared/constants.ts';

export function EventVisibilityRadioGroup({ defaultValue = 'PRIVATE' }: { defaultValue?: 'PUBLIC' | 'PRIVATE' }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(defaultValue);

  return (
    <Fieldset>
      <Legend className="font-medium text-gray-900 text-sm">{t('event-management.fields.visibility')}</Legend>

      <RadioGroup name="visibility" value={selected} onChange={setSelected}>
        <div className="mt-2 -space-y-px rounded-md bg-white">
          {EVENT_VISIBILITY.map((visibility, index) => (
            <Field key={t(`common.event.visibility.label.${visibility}`)}>
              <Radio
                value={visibility}
                className={({ checked }) =>
                  cx(
                    index === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                    index === EVENT_VISIBILITY.length - 1 ? 'rounded-br-md rounded-bl-md' : '',
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
                    <span className="ml-3 flex flex-col">
                      <Label className={cx(checked ? 'text-indigo-900' : 'text-gray-900', 'block font-medium text-sm')}>
                        {t(`common.event.visibility.label.${visibility}`)}
                      </Label>
                      <Description className={cx(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}>
                        {t(`common.event.visibility.description.${visibility}`)}
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
