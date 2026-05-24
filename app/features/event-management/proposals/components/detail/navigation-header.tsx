import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useHotkey } from '@tanstack/react-hotkeys';
import type React from 'react';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Await, href, useNavigate, useSearchParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { ReviewsProgress } from '../shared/reviews-progress.tsx';

type Props = {
  team: string;
  event: string;
  current: number;
  total: number;
  reviewed: number;
  next?: string;
  previous?: string;
  pageRef: React.RefObject<HTMLElement | null>;
  activityPromise: Promise<[Array<Message>, Array<Message>]>;
};

function isFocusedOutsidePage(pageRef: React.RefObject<HTMLElement | null>): boolean {
  const active = document.activeElement;
  return !!active && active !== document.body && !pageRef.current?.contains(active);
}

export function NavigationHeader({
  team,
  event,
  current,
  total,
  reviewed,
  next,
  previous,
  pageRef,
  activityPromise,
}: Props) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const previousPath = previous
    ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: previous })
    : undefined;

  const nextPath = next ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: next }) : undefined;

  useHotkey(
    'N',
    () => {
      if (isFocusedOutsidePage(pageRef)) return;
      navigate({ pathname: nextPath, search: searchParams.toString() });
    },
    { enabled: !!nextPath },
  );

  useHotkey(
    'P',
    () => {
      if (isFocusedOutsidePage(pageRef)) return;
      navigate({ pathname: previousPath, search: searchParams.toString() });
    },
    { enabled: !!previousPath },
  );

  return (
    <header className="flex items-center justify-between gap-4 pb-4 lg:-mt-4">
      <nav className="flex grow items-center justify-between gap-2 sm:justify-start lg:gap-4">
        <Button
          to={{ pathname: previousPath, search: searchParams.toString() }}
          icon={ChevronLeftIcon}
          label={t('event-management.proposal-page.previous')}
          variant="secondary"
          size="sm"
          disabled={!previousPath}
        />
        <Text weight="medium">{`${current}/${total}`}</Text>
        <Button
          to={{ pathname: nextPath, search: searchParams.toString() }}
          icon={ChevronRightIcon}
          label={t('event-management.proposal-page.next')}
          variant="secondary"
          size="sm"
          disabled={!nextPath}
        />
      </nav>

      <div className="flex items-center gap-8">
        <Suspense fallback={null}>
          <Await resolve={activityPromise}>
            {([comments, speakerConversation]) => (
              <NewMessagesPill comments={comments} speakerConversation={speakerConversation} />
            )}
          </Await>
        </Suspense>
        <ReviewsProgress reviewed={reviewed} total={total} />
      </div>
    </header>
  );
}

type NewMessagesPillProps = { comments: Array<Message>; speakerConversation: Array<Message> };

function NewMessagesPill({ comments, speakerConversation }: NewMessagesPillProps) {
  const { t } = useTranslation();

  const newComments = comments.filter((m) => m.isNew);
  const newSpeakerMessages = speakerConversation.filter((m) => m.isNew);
  const totalNew = newComments.length + newSpeakerMessages.length;

  if (totalNew === 0) return null;

  const scrollToFirstNew = () => {
    const firstNewComment = newComments[0];
    if (firstNewComment) {
      document.getElementById(firstNewComment.id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Only speaker messages are unread — scroll to the speaker conversation entry
    document.getElementById('speaker-conversation-entry')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToFirstNew}
      className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-blue-600 hover:underline"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
      </span>
      <span>{t('event-management.proposal-page.new-messages', { count: totalNew })}</span>
    </button>
  );
}
