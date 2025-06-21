import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  FaceSmileIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PaintBrushIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { FormEvent } from 'react';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import ColorPicker from '~/design-system/forms/color-picker.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { LANGUAGES } from '~/libs/constants.ts';
import { getMinutesFromStartOfDay, setMinutesFromStartOfDay } from '~/libs/datetimes/datetimes.ts';
import { EmojiSelect } from '~/routes/components/emojis/emoji-select.tsx';
import type { Language } from '~/types/proposals.types.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SESSION_COLORS, SESSION_EMOJIS } from './constants.ts';
import { SearchSessionProposal } from './search-session-proposal.tsx';

type Props = {
  session: ScheduleSession;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  isSearching: boolean;
  onFinish: VoidFunction;
  onToggleSearch: VoidFunction;
  onUpdateSession: (updated: ScheduleSession) => Promise<boolean>;
  onDeleteSession: (session: ScheduleSession) => Promise<void>;
};

export function SessionForm({
  session,
  displayedTimes,
  tracks,
  isSearching,
  onFinish,
  onToggleSearch,
  onUpdateSession,
  onDeleteSession,
}: Props) {
  const { t } = useTranslation();
  const { team, event } = useParams();

  const formId = useId();
  const [name, setName] = useState(session.name);
  const [color, setColor] = useState(session.color);
  const [trackId, setTrackId] = useState(session.trackId);
  const [language, setLanguage] = useState(session.language);
  const [timeslot, setTimeslot] = useState(session.timeslot);
  const [proposal, setProposal] = useState(session.proposal);
  const [emojis, setEmojis] = useState(session.emojis);
  const [error, setError] = useState<string | null>();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const success = await onUpdateSession({ ...session, name, color, language, emojis, trackId, timeslot, proposal });
    if (success) {
      setError(null);
      onFinish();
    } else {
      setError(t('event-management.schedule.edit-session.errors.overlap'));
    }
  };

  const handleDelete = async () => {
    await onDeleteSession(session);
    onFinish();
  };

  return (
    <>
      {isSearching && <SearchSessionProposal onChange={setProposal} onClose={onToggleSearch} />}

      <form id={formId} className="flex flex-col gap-6 px-6 py-6" onSubmit={handleSubmit}>
        {proposal ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <H2 size="l">{proposal?.title}</H2>
              <Subtitle truncate>{proposal?.speakers.map((s) => s.name).join(', ')}</Subtitle>
            </div>
            <div className="flex gap-2 shrink-0">
              <IconLink
                icon={ArrowTopRightOnSquareIcon}
                label={t('event-management.schedule.edit-session.proposal.see')}
                to={`/team/${team}/${event}/reviews/${proposal?.id}`}
                variant="secondary"
                target="_blank"
              />
              <IconButton
                icon={MagnifyingGlassIcon}
                label={t('event-management.schedule.edit-session.proposal.search')}
                type="button"
                onClick={onToggleSearch}
                variant="secondary"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Input
              ref={inputRef}
              name="name"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('event-management.schedule.edit-session.name')}
              aria-label={t('event-management.schedule.edit-session.name')}
              className="grow"
            />
            <IconButton
              icon={MagnifyingGlassIcon}
              label={t('event-management.schedule.edit-session.proposal.search')}
              type="button"
              onClick={onToggleSearch}
              variant="secondary"
            />
          </div>
        )}

        <div className="flex items-center gap-6">
          <ClockIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <TimeRangeInput
            nameStart="start-local"
            nameEnd="end-local"
            start={getMinutesFromStartOfDay(timeslot.start)}
            end={getMinutesFromStartOfDay(timeslot.end)}
            min={displayedTimes.start}
            max={displayedTimes.end + 59}
            step={5}
            startRelative
            hideFromLabel
            onChange={(start, end) => {
              setTimeslot({
                start: setMinutesFromStartOfDay(timeslot.start, start),
                end: setMinutesFromStartOfDay(timeslot.start, end),
              });
            }}
          />
        </div>

        <div className="flex items-center gap-6">
          <MapPinIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <SelectNative
            name="trackId"
            label={t('common.track')}
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            options={tracks.map((t) => ({ name: t.name, value: t.id }))}
            srOnly
          />
        </div>

        <div className="flex items-center gap-6">
          <LanguageIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <SelectNative
            name="language"
            label={t('common.language')}
            value={language || ''}
            placeholder={t('common.no-language')}
            onChange={(e) => setLanguage(e.target.value as Language)}
            options={LANGUAGES.map((lang) => ({ name: t(`common.languages.${lang}.label`), value: lang }))}
            srOnly
          />
        </div>

        <div className="flex items-center gap-7">
          <PaintBrushIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <ColorPicker
            label={t('event-management.schedule.edit-session.color')}
            value={color}
            onChange={setColor}
            options={SESSION_COLORS}
            srOnly
          />
        </div>

        <div className="flex items-center gap-7">
          <FaceSmileIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <EmojiSelect emojis={SESSION_EMOJIS} selectedEmojis={emojis} onChangeEmojis={setEmojis} />
        </div>

        {error ? (
          <Callout variant="error" role="alert">
            {error}
          </Callout>
        ) : null}
      </form>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-6">
        <Button variant="important" iconLeft={TrashIcon} onClick={handleDelete}>
          {t('common.remove')}
        </Button>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onFinish}>
            {t('common.cancel')}
          </Button>
          <Button form={formId} type="submit">
            {t('event-management.schedule.edit-session.submit')}
          </Button>
        </div>
      </div>
    </>
  );
}
