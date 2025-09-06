import { PlusIcon } from '@heroicons/react/16/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useFetcher } from 'react-router';
import { SelectPanel, type SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { H2, Text } from '~/design-system/typography.tsx';
import { SpeakerDrawer } from '~/features/event-management/speakers/components/speaker-details/speaker-drawer.tsx';
import { SpeakerRow } from '~/features/event-management/speakers/components/speaker-details/speaker-row.tsx';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import type { SpeakerData } from '~/shared/types/speaker.types.ts';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';
import { SpeakerModal } from './speaker-modal.tsx';

type Props = {
  team: string;
  event: string;
  form?: string;
  value?: Array<SelectPanelOption>;
  speakersDetails?: Array<SpeakerData>;
  error?: SubmissionError;
  onChange?: (speakers: Array<SelectPanelOption>) => void;
  className?: string;
  readonly?: boolean;
  showAction?: boolean;
};

export function SpeakersPanel({
  team,
  event,
  form,
  value,
  speakersDetails = [],
  error,
  onChange,
  className,
  readonly = false,
  showAction = true,
}: Props) {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const [speakers, setSpeakers] = useState<Array<SelectPanelOption>>([]);
  const selectedSpeakers = value ?? speakers;

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
    if (!value) setSpeakers(selectedOptions);
    onChange?.(selectedOptions);
  };

  const handleSpeakerCreated = (speaker: SelectPanelOption, closePanel?: () => void) => {
    const updatedSpeakers = [...selectedSpeakers, speaker];
    if (!value) setSpeakers(updatedSpeakers);
    onChange?.(updatedSpeakers);
    closePanel?.();
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

  if (readonly) {
    return (
      <div className={className}>
        <H2 size="s">{t('common.speakers')}</H2>
        <SpeakersList speakers={selectedSpeakers} speakersDetails={speakersDetails} />
      </div>
    );
  }

  return (
    <div className={className}>
      <SelectPanel
        name="speakers"
        form={form}
        label={t('common.speakers')}
        values={selectedSpeakers.map((speaker) => speaker.value)}
        loading={loading}
        options={availableOptions}
        onChange={handleChange}
        onSearch={handleSearch}
        footer={
          showAction
            ? (closePanel: () => void) => (
                <SpeakerModal
                  team={team}
                  event={event}
                  onSpeakerCreated={(speaker) => handleSpeakerCreated(speaker, closePanel)}
                >
                  {({ onOpen }) => (
                    <button
                      type="button"
                      className={cx('hover:bg-gray-100 focus:outline-indigo-600', menuItem())}
                      onClick={onOpen}
                    >
                      <PlusIcon className="h-5 w-5 text-gray-400" aria-hidden />
                      {t('common.speakers-select-panel.manage')}
                    </button>
                  )}
                </SpeakerModal>
              )
            : null
        }
        displayPicture
      >
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.speakers')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <SpeakersList speakers={selectedSpeakers} speakersDetails={speakersDetails} error={error} />
    </div>
  );
}

type SpeakersListProps = {
  speakers: Array<SelectPanelOption>;
  speakersDetails?: Array<SpeakerData>;
  error?: SubmissionError;
};

function SpeakersList({ speakers, speakersDetails, error }: SpeakersListProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      {speakers.length === 0 && !error ? <Text size="xs">{t('common.no-speakers')}</Text> : null}

      {error ? (
        <Text size="s" variant="error">
          {error[0]}
        </Text>
      ) : null}

      {speakers.map((speaker) => {
        const speakerDetails = speakersDetails?.find((s) => speaker.value === s.id);

        if (speakerDetails) {
          return (
            <SpeakerDrawer key={speaker.value} speaker={speakerDetails}>
              <SpeakerRow name={speaker.label} picture={speaker.picture} description={speaker.data?.description} />
            </SpeakerDrawer>
          );
        }

        return (
          <SpeakerRow
            key={speaker.value}
            name={speaker.label}
            picture={speaker.picture}
            description={speaker.data?.description}
          />
        );
      })}
    </div>
  );
}
