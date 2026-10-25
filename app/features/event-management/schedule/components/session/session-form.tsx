import {
  ClockIcon,
  FaceSmileIcon,
  LanguageIcon,
  LockClosedIcon,
  LockOpenIcon,
  MapPinIcon,
  PaintBrushIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { differenceInMinutes } from 'date-fns';
import type { ChangeEvent, FormEvent } from 'react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { EmojiSelect } from '~/design-system/emojis/emoji-select.tsx';
import { ColorInput } from '~/design-system/forms/color-input.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { Text } from '~/design-system/typography.tsx';
import { LANGUAGES } from '~/shared/constants.ts';
import {
  formatDuration,
  getMinutesFromStartOfDay,
  setMinutesFromStartOfDay,
  toDateInput,
} from '~/shared/datetimes/datetimes.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import { categoryColor } from '../../models/category-color.ts';
import { useSettings } from '../../store/schedule-store.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SESSION_EMOJIS } from './constants.ts';
import { SessionIdentityField } from './session-identity-field.tsx';

const FIELD_LABEL_CLASS = 'w-20 shrink-0 leading-6';

type Props = {
  mode: 'create' | 'edit';
  session: ScheduleSession;
  categories: Array<{ id: string; color: string }>;
  onFinish: VoidFunction;
};

export function SessionForm({ mode, session, categories, onFinish }: Props) {
  const { t, i18n } = useTranslation();
  const { tracks, scheduleDays, displayedTimes } = useSettings();
  const { addSession, updateSession, deleteSession, setSessionLock } = useScheduleContext();

  const formId = useId();
  const timeLabelId = useId();
  const [name, setName] = useState(session.name ?? '');
  const [color, setColor] = useState(session.color);
  const [trackId, setTrackId] = useState(session.trackId);
  const [language, setLanguage] = useState(session.language);
  const [timeslot, setTimeslot] = useState(session.timeslot);
  const [proposal, setProposal] = useState(session.proposal ?? null);
  const [emojis, setEmojis] = useState(session.emojis);
  const [error, setError] = useState<string | null>();
  const [locked, setLocked] = useState(session.locked);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const edited = { ...session, name, color, language, emojis, trackId, timeslot, proposal };
    const outcome = mode === 'create' ? await addSession(edited) : await updateSession(edited);
    if (outcome.status === 'conflict') {
      setError(t('event-management.schedule.errors.session-conflict'));
    } else {
      setError(null);
      onFinish();
    }
  };

  const handleLock = async (nextLocked: boolean) => {
    await setSessionLock(session, nextLocked);
    if (nextLocked) resetFields();
    setLocked(nextLocked);
  };

  const resetFields = () => {
    setName(session.name ?? '');
    setColor(session.color);
    setTrackId(session.trackId);
    setLanguage(session.language);
    setTimeslot(session.timeslot);
    setProposal(session.proposal ?? null);
    setEmojis(session.emojis);
    setError(null);
  };

  const handleDelete = async () => {
    await deleteSession(session);
    onFinish();
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const day = scheduleDays.find((d) => toDateInput(d) === event.target.value);
    if (!day) return;
    setTimeslot({
      start: setMinutesFromStartOfDay(day, getMinutesFromStartOfDay(timeslot.start)),
      end: setMinutesFromStartOfDay(day, getMinutesFromStartOfDay(timeslot.end)),
    });
  };

  return (
    <>
      <form id={formId} className="px-6 py-6" onSubmit={handleSubmit}>
        <fieldset disabled={locked} className="flex min-w-0 flex-col gap-6">
          <SessionIdentityField
            name={name}
            proposal={proposal}
            onChange={(identity) => {
              setName(identity.name);
              setProposal(identity.proposal);
              if (identity.proposal) {
                const linked = categories.filter((category) => identity.categoryIds?.includes(category.id));
                const color = categoryColor(linked);
                if (color) setColor(color);
              }
            }}
          />

          <div className="flex items-center gap-6">
            <ClockIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
            <div className="flex w-full items-center gap-2.5">
              <Text as="span" id={timeLabelId} weight="medium" className={FIELD_LABEL_CLASS}>
                {t('event-management.schedule.edit-session.time')}
              </Text>
              <div role="group" aria-labelledby={timeLabelId} className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  name="date"
                  aria-label={t('common.date')}
                  value={toDateInput(timeslot.start) ?? ''}
                  min={toDateInput(scheduleDays.at(0)) ?? ''}
                  max={toDateInput(scheduleDays.at(-1)) ?? ''}
                  onChange={handleDateChange}
                  className="shrink-0"
                  suppressHydrationWarning
                />
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
                <Badge>{formatDuration(differenceInMinutes(timeslot.end, timeslot.start), i18n.language)}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <MapPinIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
            <SelectNative
              name="trackId"
              label={t('common.track')}
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              options={tracks.map((t) => ({ name: t.name, value: t.id }))}
              labelClassName={FIELD_LABEL_CLASS}
              inline
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
              labelClassName={FIELD_LABEL_CLASS}
              inline
            />
          </div>

          <div className="flex items-center gap-6">
            <PaintBrushIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <Text as="span" weight="medium" className={FIELD_LABEL_CLASS}>
                {t('common.color.label')}
              </Text>
              <ColorInput
                label={t('event-management.schedule.edit-session.color')}
                nullable
                value={color}
                onChange={setColor}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <FaceSmileIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <Text as="span" weight="medium" className={FIELD_LABEL_CLASS}>
                {t('event-management.schedule.edit-session.emojis')}
              </Text>
              <EmojiSelect emojis={SESSION_EMOJIS} selectedEmojis={emojis} onChangeEmojis={setEmojis} />
            </div>
          </div>

          {error ? (
            <Callout variant="error" role="alert">
              {error}
            </Callout>
          ) : null}
        </fieldset>
      </form>

      {locked ? (
        <p className="flex items-center gap-2 px-6 text-sm text-gray-500">
          <LockClosedIcon className="size-4 shrink-0" aria-hidden="true" />
          {t('event-management.schedule.edit-session.locked')}
        </p>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-6">
        {mode === 'edit' ? (
          <div className="flex gap-3">
            {locked ? null : (
              <Button variant="important" iconLeft={TrashIcon} onClick={handleDelete}>
                {t('common.remove')}
              </Button>
            )}
            <Button
              variant="secondary"
              iconLeft={locked ? LockOpenIcon : LockClosedIcon}
              onClick={() => handleLock(!locked)}
            >
              {t(`event-management.schedule.edit-session.${locked ? 'unlock' : 'lock'}`)}
            </Button>
          </div>
        ) : (
          <span />
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onFinish}>
            {locked ? t('common.close') : t('common.cancel')}
          </Button>
          {locked ? null : (
            <Button form={formId} type="submit">
              {t(`event-management.schedule.${mode}-session.submit`)}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
