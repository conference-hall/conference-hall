import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTime, formatTimeDifference } from '~/libs/datetimes/datetimes.ts';
import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SESSION_COLORS, SESSION_EMOJIS } from './constants.ts';
import { SessionModal } from './session-modal.tsx';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SessionBlockProps = {
  session: ScheduleSession;
  height: number;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  onUpdateSession: (updated: ScheduleSession) => Promise<boolean>;
  onDeleteSession: (session: ScheduleSession) => Promise<void>;
};

export function SessionBlock({
  session,
  height,
  displayedTimes,
  tracks,
  onUpdateSession,
  onDeleteSession,
}: SessionBlockProps) {
  const [edit, setEdit] = useState(false);
  const { timeslot, proposal, language, emojis } = session;

  const { block } = SESSION_COLORS.find((c) => c.value === session.color) ?? SESSION_COLORS[0];

  const size = getSize(height);
  const title = proposal ? proposal.title : session.name;

  if (size === 'xs') return <div className={cx('h-full', block)} />;

  return (
    <>
      <button
        type="button"
        onClick={() => setEdit(true)}
        className={cx(
          'flex flex-col h-full w-full text-left px-1 rounded-sm cursor-pointer',
          {
            'text-[10px] items-center gap-1 flex-row': size === 'sm',
            'text-[10px] items-baseline leading-3 gap-1 flex-row': size === 'md',
            'text-xs leading-3.5 justify-between': size === 'lg' || size === 'xl',
            'border-dotted': session.isCreating,
          },
          block,
        )}
      >
        {title ? (
          <div className={cx({ truncate: size !== 'xl' })}>
            <p className={cx('font-semibold line-clamp-3', { truncate: size !== 'xl' })}>{title}</p>
            <SessionSpeakers speakers={proposal?.speakers} size={size} />
          </div>
        ) : null}

        <div className={cx('flex shrink-0 gap-1', { 'mt-0.5': size === 'md', 'items-end': !title })}>
          <SessionTime timeslot={timeslot} size={size} />
          <SessionEmojis emojis={emojis} size={size} />
          <SessionLanguage language={language} size={size} />
        </div>
      </button>

      {edit && (
        <SessionModal
          session={session}
          displayedTimes={displayedTimes}
          tracks={tracks}
          onUpdateSession={onUpdateSession}
          onDeleteSession={onDeleteSession}
          onClose={() => setEdit(false)}
        />
      )}
    </>
  );
}

type SessionSpeakersProps = { speakers?: Array<{ name: string | null; picture: string | null }>; size: Size };

function SessionSpeakers({ speakers, size }: SessionSpeakersProps) {
  if (!speakers) return null;
  const firstSpeaker = speakers.at(0);
  const speakersCount = speakers.length;
  const suffix = speakersCount > 1 ? ` (+${speakersCount})` : '';

  if (size === 'xs' || size === 'sm') return null;
  return <p className={cx('text-[10px]', { truncate: size !== 'xl' })}>{`${firstSpeaker?.name}${suffix}`}</p>;
}

type SessionTimeProps = { timeslot: TimeSlot; size: Size };

function SessionTime({ timeslot, size }: SessionTimeProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const start = formatTime(timeslot.start, { format: 'short', locale });
  const end = formatTime(timeslot.end, { format: 'short', locale });
  const minutes = formatTimeDifference(timeslot.start, timeslot.end);

  return (
    <p className="text-[10px]">
      {size === 'sm' || size === 'md' ? (
        <time dateTime={start}>{start}</time>
      ) : (
        <>
          <time dateTime={start}>{start}</time> - <time dateTime={end}>{end}</time> <span>({minutes})</span>
        </>
      )}
    </p>
  );
}

type SessionEmojisProps = { emojis: Array<string>; size: Size };

function SessionEmojis({ emojis, size }: SessionEmojisProps) {
  return emojis?.map((code) => {
    const emoji = SESSION_EMOJIS.find((e) => e.code === code);
    return (
      <p
        key={code}
        className={cx({
          'text-[10px]': size === 'sm' || size === 'md',
          'text-xs': size === 'lg' || size === 'xl',
        })}
      >
        {emoji?.skin}
      </p>
    );
  });
}

type SessionLanguageProps = { language: Language | null; size: Size };

function SessionLanguage({ language, size }: SessionLanguageProps) {
  const { t } = useTranslation();
  if (!language) return null;
  return (
    <p
      className={cx({
        'text-[10px]': size === 'sm' || size === 'md',
        'text-xs': size === 'lg' || size === 'xl',
      })}
    >
      {t(`common.languages.${language}.flag`)}
    </p>
  );
}

function getSize(height: number): Size {
  if (height < 8) return 'xs';
  if (height < 24) return 'sm';
  if (height < 40) return 'md';
  if (height < 56) return 'lg';
  return 'xl';
}
