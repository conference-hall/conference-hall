import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useHotkey } from '@tanstack/react-hotkeys';
import type React from 'react';
import { Suspense } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Await, href, useNavigate, useSearchParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { ReviewsProgress } from '../shared/reviews-progress.tsx';
import type { DiscussionTab } from './discussion/discussion-card.tsx';
import { isFocusedOutsidePage } from './is-focused-outside-page.ts';

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
  onSelectDiscussionTab: (tab: DiscussionTab) => void;
};

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
  onSelectDiscussionTab,
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
    (keyboardEvent) => {
      if (isFocusedOutsidePage(pageRef)) return;
      keyboardEvent.preventDefault();
      navigate({ pathname: nextPath, search: searchParams.toString() });
    },
    { enabled: !!nextPath, preventDefault: false, stopPropagation: false },
  );

  useHotkey(
    'P',
    (keyboardEvent) => {
      if (isFocusedOutsidePage(pageRef)) return;
      keyboardEvent.preventDefault();
      navigate({ pathname: previousPath, search: searchParams.toString() });
    },
    { enabled: !!previousPath, preventDefault: false, stopPropagation: false },
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
              <NewMessagesPill
                comments={comments}
                speakerConversation={speakerConversation}
                onSelectDiscussionTab={onSelectDiscussionTab}
              />
            )}
          </Await>
        </Suspense>
        <ReviewsProgress reviewed={reviewed} total={total} />
      </div>
    </header>
  );
}

type NewMessagesPillProps = {
  comments: Array<Message>;
  speakerConversation: Array<Message>;
  onSelectDiscussionTab: (tab: DiscussionTab) => void;
};

function NewMessagesPill({ comments, speakerConversation, onSelectDiscussionTab }: NewMessagesPillProps) {
  const { t } = useTranslation();

  const newComments = comments.filter((m) => m.isNew);
  const newSpeakerMessages = speakerConversation.filter((m) => m.isNew);
  const totalNew = newComments.length + newSpeakerMessages.length;

  if (totalNew === 0) return null;

  const scrollToFirstNew = () => {
    const tab = newComments.length > 0 ? 'comments' : 'speakers';
    const firstNew = tab === 'comments' ? newComments[0] : newSpeakerMessages[0];
    flushSync(() => onSelectDiscussionTab(tab));
    document.getElementById(firstNew.id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToFirstNew}
      className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-blue-500 hover:underline"
    >
      <StatusPill status="info" size="sm" ping />
      <span>{t('event-management.proposal-page.new-messages', { count: totalNew })}</span>
    </button>
  );
}
