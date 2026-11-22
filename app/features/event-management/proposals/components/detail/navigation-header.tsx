import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useHotkey } from '@tanstack/react-hotkeys';
import { cx } from 'class-variance-authority';
import type React from 'react';
import { Suspense } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Await, useNavigate } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { ReviewsProgress } from '../shared/reviews-progress.tsx';
import type { DiscussionTab } from './discussion/discussion-card.tsx';
import { isFocusedOutsidePage } from './is-focused-outside-page.ts';
import { useProposalNavigation } from './use-proposal-navigation.ts';

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
  speakersConversationEnabled: boolean;
  navigationInReviewBar: boolean;
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
  speakersConversationEnabled,
  navigationInReviewBar,
  onSelectDiscussionTab,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { previousPath, nextPath, search } = useProposalNavigation({ team, event, previous, next });

  useHotkey(
    'N',
    (keyboardEvent) => {
      if (isFocusedOutsidePage(pageRef)) return;
      keyboardEvent.preventDefault();
      navigate({ pathname: nextPath, search });
    },
    { enabled: !!nextPath, preventDefault: false, stopPropagation: false },
  );

  useHotkey(
    'P',
    (keyboardEvent) => {
      if (isFocusedOutsidePage(pageRef)) return;
      keyboardEvent.preventDefault();
      navigate({ pathname: previousPath, search });
    },
    { enabled: !!previousPath, preventDefault: false, stopPropagation: false },
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-4 lg:-mt-4">
      <nav className="flex grow items-center justify-between gap-2 sm:justify-start lg:gap-4">
        <Button
          to={{ pathname: previousPath, search }}
          icon={ChevronLeftIcon}
          label={t('event-management.proposal-page.previous')}
          variant="secondary"
          size="sm"
          disabled={!previousPath}
          className={cx({ 'max-lg:hidden': navigationInReviewBar })}
        />
        <Text weight="medium">{`${current}/${total}`}</Text>
        <Button
          to={{ pathname: nextPath, search }}
          icon={ChevronRightIcon}
          label={t('event-management.proposal-page.next')}
          variant="secondary"
          size="sm"
          disabled={!nextPath}
          className={cx({ 'max-lg:hidden': navigationInReviewBar })}
        />
      </nav>

      <div className="ml-auto flex items-center gap-4 sm:gap-8">
        <Suspense fallback={null}>
          <Await resolve={activityPromise}>
            {([comments, speakerConversation]) => (
              <NewMessagesPill
                comments={comments}
                speakerConversation={speakersConversationEnabled ? speakerConversation : []}
                onSelectDiscussionTab={onSelectDiscussionTab}
              />
            )}
          </Await>
        </Suspense>
        <ReviewsProgress reviewed={reviewed} total={total} className="flex" />
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
