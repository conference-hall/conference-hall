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
import type { ChangeEvent, ComponentType, FormEvent, ReactNode } from 'react';
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
import { Label, Text } from '~/design-system/typography.tsx';
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

const FOOTER = 'flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4';
const FOOTER_BUTTON = 'flex-1 sm:flex-none';

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
    if (!confirm(t('event-management.schedule.edit-session.delete-confirm'))) return;
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
      <fieldset disabled={locked} className="min-w-0 border-b border-gray-200 px-6 py-6">
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
      </fieldset>

      <form id={formId} className="px-6 py-6" onSubmit={handleSubmit}>
        <fieldset disabled={locked} className="flex min-w-0 flex-col gap-6">
          <SessionFieldRow
            icon={ClockIcon}
            label={t('event-management.schedule.edit-session.time')}
            labelId={timeLabelId}
          >
            <div role="group" aria-labelledby={timeLabelId} className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                name="date"
                aria-label={t('common.date')}
                value={toDateInput(timeslot.start) ?? ''}
                min={toDateInput(scheduleDays.at(0)) ?? ''}
                max={toDateInput(scheduleDays.at(-1)) ?? ''}
                onChange={handleDateChange}
                className="w-full shrink-0 sm:w-auto"
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
              <span className="ml-2 flex">
                <Badge>{formatDuration(differenceInMinutes(timeslot.end, timeslot.start), i18n.language)}</Badge>
              </span>
            </div>
          </SessionFieldRow>

          <SessionFieldRow icon={MapPinIcon} label={t('common.track')} htmlFor="trackId">
            <SelectNative
              name="trackId"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              options={tracks.map((t) => ({ name: t.name, value: t.id }))}
            />
          </SessionFieldRow>

          <SessionFieldRow icon={LanguageIcon} label={t('common.language')} htmlFor="language">
            <SelectNative
              name="language"
              value={language || ''}
              placeholder={t('common.no-language')}
              onChange={(e) => setLanguage(e.target.value as Language)}
              options={LANGUAGES.map((lang) => ({ name: t(`common.languages.${lang}.label`), value: lang }))}
            />
          </SessionFieldRow>

          <SessionFieldRow icon={PaintBrushIcon} label={t('common.color.label')}>
            <ColorInput
              label={t('event-management.schedule.edit-session.color')}
              nullable
              value={color}
              onChange={setColor}
            />
          </SessionFieldRow>

          <SessionFieldRow icon={FaceSmileIcon} label={t('event-management.schedule.edit-session.emojis')}>
            <EmojiSelect emojis={SESSION_EMOJIS} selectedEmojis={emojis} onChangeEmojis={setEmojis} />
          </SessionFieldRow>

          {error ? (
            <Callout variant="error" role="alert">
              {error}
            </Callout>
          ) : null}
        </fieldset>
      </form>

      {locked ? (
        <div className={FOOTER}>
          <div className="flex items-center gap-2">
            <Button
              variant="tertiary"
              icon={LockClosedIcon}
              label={t('event-management.schedule.edit-session.unlock')}
              onClick={() => handleLock(false)}
            />
            <Text variant="secondary">{t('event-management.schedule.edit-session.locked')}</Text>
          </div>
          <Button variant="secondary" onClick={onFinish}>
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <div className={FOOTER}>
          {mode === 'edit' ? (
            <div className="flex items-center gap-1">
              <Button
                variant="tertiary"
                icon={LockOpenIcon}
                label={t('event-management.schedule.edit-session.lock')}
                onClick={() => handleLock(true)}
              />
              <Button
                variant="tertiary"
                icon={TrashIcon}
                label={t('common.remove')}
                onClick={handleDelete}
                className="hover:bg-red-50 hover:text-red-600"
              />
            </div>
          ) : (
            <span />
          )}
          <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
            <Button variant="secondary" onClick={onFinish} className={FOOTER_BUTTON}>
              {t('common.cancel')}
            </Button>
            <Button form={formId} type="submit" className={FOOTER_BUTTON}>
              {t(`event-management.schedule.${mode}-session.submit`)}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

type SessionFieldRowProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  htmlFor?: string;
  labelId?: string;
  children: ReactNode;
};

function SessionFieldRow({ icon: Icon, label, htmlFor, labelId, children }: SessionFieldRowProps) {
  const labelClassName = 'shrink-0 leading-6 sm:w-20';
  return (
    <div className="flex items-start gap-3 sm:items-center">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 sm:mt-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} weight="normal" variant="secondary" className={labelClassName}>
            {label}
          </Label>
        ) : (
          <Text as="span" id={labelId} weight="normal" variant="secondary" className={labelClassName}>
            {label}
          </Text>
        )}
        {children}
      </div>
    </div>
  );
}
