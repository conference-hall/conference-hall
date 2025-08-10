import { PlusIcon } from '@heroicons/react/16/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useFetcher } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { SelectPanel, type SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { H2, Text } from '~/design-system/typography.tsx';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';

type Props = {
  team: string;
  event: string;
  form: string;
  defaultValues?: Array<SelectPanelOption>;
  error?: SubmissionError;
  onChange?: (speakers: Array<SelectPanelOption>) => void;
  className?: string;
};

export function SpeakersSelectPanel({ team, event, form, defaultValues = [], error, onChange, className }: Props) {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const [selectedSpeakers, setSelectedSpeakers] = useState<Array<SelectPanelOption>>(defaultValues);

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const searchOptions = useMemo(() => {
    return (
      fetcher.data?.map((item) => ({
        value: item.id,
        label: item.title,
        picture: item.picture,
        data: { description: item.description },
      })) ?? []
    );
  }, [fetcher.data]);

  const handleSearch = async (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('kind', 'speakers');

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    await fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
  };

  const handleChange = (selectedOptions: SelectPanelOption[]) => {
    setSelectedSpeakers(selectedOptions);
    onChange?.(selectedOptions);
  };

  const availableOptions = useMemo(() => {
    const searchOptionsMap = new Map(searchOptions.map((option) => [option.value, option]));
    const options: Array<SelectPanelOption> = [...searchOptions];
    selectedSpeakers.forEach((speaker) => {
      if (!searchOptionsMap.has(speaker.value)) {
        options.push(speaker);
      }
    });

    return options;
  }, [searchOptions, selectedSpeakers]);

  return (
    <div className={className}>
      <SelectPanel
        name="speakers"
        form={form}
        label={t('common.speakers')}
        defaultValue={selectedSpeakers.map((speaker) => speaker.value)}
        loading={loading}
        options={availableOptions}
        onChange={handleChange}
        onSearch={handleSearch}
        footer={<Action />}
        displayPicture
      >
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.speakers')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <div className="flex flex-col gap-2">
        {selectedSpeakers.length === 0 && !error ? <Text size="xs">{t('common.no-speakers')}</Text> : null}

        {selectedSpeakers.length === 0 && error ? (
          <Text size="s" variant="error">
            {error[0]}
          </Text>
        ) : null}

        {selectedSpeakers.map((speaker) => (
          <div key={speaker.value} className="flex items-center gap-2 truncate">
            <Avatar picture={speaker.picture} name={speaker.label} size="xs" />
            <div className="flex items-baseline gap-2 truncate">
              <Text weight="semibold" truncate>
                {speaker.label}
              </Text>
              {speaker.data?.description ? (
                <Text variant="secondary" size="xs" truncate>
                  {speaker.data?.description}
                </Text>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Action() {
  const { t } = useTranslation();
  return (
    <button type="button" className={cx('hover:bg-gray-100', menuItem())}>
      <PlusIcon className="h-5 w-5 text-gray-400" aria-hidden />
      {t('common.speakers-select-panel.manage')}
    </button>
  );
}
