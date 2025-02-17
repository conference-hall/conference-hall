import {} from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';

import { formatTimeDifference, toTimeFormat } from '~/libs/datetimes/datetimes.ts';
import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import { getFlag } from '~/libs/formatters/languages.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SESSION_COLORS, SESSION_EMOJIS } from './constants.ts';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SessionBlockProps = { session: ScheduleSession; height: number };
export function SessionBlock({ session, height }: SessionBlockProps) {
  const { timeslot, proposal, language, emojis } = session;

  const { block } = SESSION_COLORS.find((c) => c.value === session.color) ?? SESSION_COLORS[0];

  const size = getSize(height);
  const title = proposal ? proposal.title : session.name;

  if (size === 'xs') return <div className={cx('h-full', block)} />;

  return (
    <div
      className={cx(
        'flex flex-col h-full px-1 rounded-sm',
        {
          'text-[10px] items-center gap-1 flex-row': size === 'sm',
          'text-[10px] items-baseline leading-3 gap-1 flex-row': size === 'md',
          'text-xs leading-3.5 justify-between': size === 'lg' || size === 'xl',
        },
        block,
      )}
    >
      {title ? (
        <div className={cx({ truncate: size !== 'xl' })}>
          <p className={cx('font-semibold', { truncate: size !== 'xl' })}>{title}</p>
          <SessionSpeakers speakers={proposal?.speakers} size={size} />
        </div>
      ) : null}
      <div className={cx('flex shrink-0 gap-1', { 'mt-0.5': size === 'md', 'items-end': !title })}>
        <SessionTime timeslot={timeslot} size={size} />
        <SessionEmojis emojis={emojis} size={size} />
        <SessionLanguage language={language} size={size} />
      </div>
    </div>
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
  const start = toTimeFormat(timeslot.start);
  const end = toTimeFormat(timeslot.end);
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

type SessionLanguageProps = { language: string | null; size: Size };
function SessionLanguage({ language, size }: SessionLanguageProps) {
  if (!language) return null;
  return (
    <p
      className={cx({
        'text-[10px]': size === 'sm' || size === 'md',
        'text-xs': size === 'lg' || size === 'xl',
      })}
    >
      {getFlag(language)}
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
