import { LockClosedIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { differenceInMinutes } from 'date-fns';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { isHexColor } from '~/shared/colors/colors.ts';
import { formatDuration } from '~/shared/datetimes/datetimes.ts';
import type { TimeSlot } from '~/shared/datetimes/timeslots.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import type { ScheduleTime } from '../../models/schedule-time.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SESSION_EMOJIS } from './constants.ts';

// A Session block shows as much as its height allows. What it shows is decided by CSS: the element wrapping the
// block is a `session` size container, and the five `session-*` variants of the stylesheet are the five heights
// the block is drawn at. The block itself renders one DOM at every height and never reads a pixel.

type SessionBlockProps = {
  session: ScheduleSession;
  onOpen: VoidFunction;
};

const TEXT_COLOR = '#1c1917';

const borderOf = (color: string) => `color-mix(in srgb, ${color} 55%, black 15%)`;

const TRUNCATED = 'session-xs:truncate session-sm:truncate session-md:truncate session-lg:truncate';
const HIDDEN_WHEN_TINY = 'session-xs:hidden';

export function SessionBlock({ session, onOpen }: SessionBlockProps) {
  const { t } = useTranslation();
  const { scheduleTime, setSessionLock } = useScheduleContext();
  const { timeslot, proposal, language, emojis } = session;

  const color = isHexColor(session.color) ? session.color : null;
  const colorStyle = color
    ? {
        color: TEXT_COLOR,
        backgroundColor: `color-mix(in srgb, ${color} 12%, white)`,
        borderColor: borderOf(color),
      }
    : undefined;

  const title = proposal ? proposal.title : session.name;
  const emptyStyle = !title && !session.isCreating ? buildEmptyStyle(color ?? '#78716c') : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onOpen();
      }}
      className={cx(
        'relative flex h-full w-full cursor-pointer flex-col rounded-sm border px-1 text-left',
        'session-sm:flex-row session-sm:items-center session-sm:gap-1 session-sm:text-[10px]',
        'session-md:flex-row session-md:items-baseline session-md:gap-1 session-md:text-[10px] session-md:leading-3',
        'session-lg:justify-between session-lg:text-xs session-lg:leading-3.5',
        'session-xl:justify-between session-xl:text-xs session-xl:leading-3.5',
        { 'border-dotted': session.isCreating },
        emptyStyle ? 'border-dashed' : color ? null : 'border-stone-300 bg-stone-50 text-stone-600',
      )}
      style={emptyStyle ?? colorStyle}
    >
      {session.locked ? (
        <button
          type="button"
          aria-label={t('event-management.schedule.edit-session.unlock')}
          title={t('event-management.schedule.edit-session.unlock')}
          onClick={(event) => {
            event.stopPropagation();
            setSessionLock(session, false);
          }}
          onKeyDown={(event) => event.stopPropagation()}
          className="absolute top-0.5 right-0.5 z-10 cursor-pointer rounded-full bg-white/80 p-px opacity-90 hover:opacity-100"
        >
          <LockClosedIcon className="size-3" aria-hidden="true" />
        </button>
      ) : null}
      {title ? (
        <div className={cx(HIDDEN_WHEN_TINY, TRUNCATED)}>
          <p className={cx('line-clamp-3 font-semibold', TRUNCATED)}>{title}</p>
          <SessionSpeakers speakers={proposal?.speakers} />
        </div>
      ) : null}

      <div className={cx('flex shrink-0 gap-1 session-md:mt-0.5', HIDDEN_WHEN_TINY, { 'items-end': !title })}>
        <SessionTime timeslot={timeslot} scheduleTime={scheduleTime} />
        <SessionEmojis emojis={emojis} />
        <SessionLanguage language={language} />
      </div>
    </div>
  );
}

function buildEmptyStyle(color: string): CSSProperties {
  return {
    color: TEXT_COLOR,
    backgroundColor: 'white',
    backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${color} 45%, transparent) 0 1px, transparent 1px 7px)`,
    borderColor: borderOf(color),
  };
}

type SessionSpeakersProps = { speakers?: Array<{ name: string | null; picture: string | null }> };

function SessionSpeakers({ speakers }: SessionSpeakersProps) {
  if (!speakers?.length) return null;
  const firstSpeaker = speakers.at(0);
  const speakersCount = speakers.length - 1;
  const suffix = speakers.length > 1 ? ` (+${speakersCount})` : '';

  return <p className={cx('text-[10px] session-sm:hidden', TRUNCATED)}>{`${firstSpeaker?.name}${suffix}`}</p>;
}

type SessionTimeProps = { timeslot: TimeSlot; scheduleTime: ScheduleTime };

function SessionTime({ timeslot, scheduleTime }: SessionTimeProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const start = scheduleTime.formatTime(timeslot.start, locale);
  const end = scheduleTime.formatTime(timeslot.end, locale);
  const minutes = formatDuration(differenceInMinutes(timeslot.end, timeslot.start), locale);

  return (
    <p className="text-[10px]">
      <time dateTime={start}>{start}</time>
      <span className="session-sm:hidden session-md:hidden">
        {' - '}
        <time dateTime={end}>{end}</time> <span>({minutes})</span>
      </span>
    </p>
  );
}

function SessionEmojis({ emojis }: { emojis: Array<string> }) {
  return emojis?.map((code) => {
    const emoji = SESSION_EMOJIS.find((e) => e.code === code);
    return (
      <p key={code} className="session-sm:text-[10px] session-md:text-[10px] session-lg:text-xs session-xl:text-xs">
        {emoji?.skin}
      </p>
    );
  });
}

function SessionLanguage({ language }: { language: Language | null }) {
  const { t } = useTranslation();
  if (!language) return null;
  return (
    <p className="session-sm:text-[10px] session-md:text-[10px] session-lg:text-xs session-xl:text-xs">
      {t(`common.languages.${language}.flag`)}
    </p>
  );
}
