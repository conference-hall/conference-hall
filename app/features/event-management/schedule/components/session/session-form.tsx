import {
  ClockIcon,
  FaceSmileIcon,
  LanguageIcon,
  MapPinIcon,
  PaintBrushIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { FormEvent } from 'react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { EmojiSelect } from '~/design-system/emojis/emoji-select.tsx';
import ColorPicker from '~/design-system/forms/color-picker.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { LANGUAGES } from '~/shared/constants.ts';
import { getMinutesFromStartOfDay, setMinutesFromStartOfDay } from '~/shared/datetimes/datetimes.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SESSION_COLORS, SESSION_EMOJIS } from './constants.ts';
import { SessionIdentityField } from './session-identity-field.tsx';

type Props = {
  session: ScheduleSession;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  onFinish: VoidFunction;
  onUpdateSession: (updated: ScheduleSession) => Promise<boolean>;
  onDeleteSession: (session: ScheduleSession) => Promise<void>;
};

export function SessionForm({ session, displayedTimes, tracks, onFinish, onUpdateSession, onDeleteSession }: Props) {
  const { t } = useTranslation();

  const formId = useId();
  const [name, setName] = useState(session.name ?? '');
  const [color, setColor] = useState(session.color);
  const [trackId, setTrackId] = useState(session.trackId);
  const [language, setLanguage] = useState(session.language);
  const [timeslot, setTimeslot] = useState(session.timeslot);
  const [proposal, setProposal] = useState(session.proposal ?? null);
  const [emojis, setEmojis] = useState(session.emojis);
  const [error, setError] = useState<string | null>();

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
      <form id={formId} className="flex flex-col gap-6 px-6 py-6" onSubmit={handleSubmit}>
        <SessionIdentityField
          name={name}
          proposal={proposal}
          onChange={(identity) => {
            setName(identity.proposal ? identity.proposal.title : identity.name);
            setProposal(identity.proposal);
          }}
        />

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
          <Button form={formId} type="submit" disabled={!(name.trim() || proposal)}>
            {t('event-management.schedule.edit-session.submit')}
          </Button>
        </div>
      </div>
    </>
  );
}
