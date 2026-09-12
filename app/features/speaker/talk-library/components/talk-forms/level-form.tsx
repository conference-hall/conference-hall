import { useTranslation } from 'react-i18next';
import { FieldsetGroup } from '~/design-system/forms/fieldset-group.tsx';
import { TALK_LEVELS } from '~/shared/constants.ts';

type Props = { initialValue?: string | null };

export function LevelForm({ initialValue }: Props) {
  const { t } = useTranslation();

  const options = [
    { value: '', label: t('talk.level.all') },
    ...TALK_LEVELS.map((level) => ({ value: level, label: t(`common.level.${level}`) })),
  ];

  return (
    <FieldsetGroup legend={t('talk.level')} hint={t('common.optional')}>
      <div className="w-fit gap-1 rounded-lg bg-slate-100 p-1 ring-1 ring-gray-200 ring-inset lg:flex">
        {options.map(({ value, label }) => (
          <label
            key={value || 'ALL'}
            className="cursor-pointer rounded-md px-3 py-1 text-sm text-gray-600 outline-hidden has-checked:bg-white has-checked:shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-indigo-600"
          >
            <input
              type="radio"
              name="level"
              value={value}
              className="sr-only"
              defaultChecked={(initialValue ?? '') === value}
            />
            {label}
          </label>
        ))}
      </div>
    </FieldsetGroup>
  );
}
