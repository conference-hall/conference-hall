import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ChatBubbleLeftRightIcon, LockClosedIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { CommentsPanel } from './comments-panel.tsx';
import type { ReviewMember, ReviewSummary } from './reviews-panel.tsx';
import { countActiveReviews, ReviewsPanel } from './reviews-panel.tsx';
import { SpeakersPanel } from './speakers-panel.tsx';

export type DiscussionTab = 'comments' | 'reviews' | 'speakers';

type Props = {
  selectedTab: DiscussionTab;
  onSelectTab: (tab: DiscussionTab) => void;
  comments: Array<Message>;
  reviews: Array<ReviewMember> | null;
  reviewsSummary: ReviewSummary | null;
  speakerConversation: { messages: Array<Message>; recipients: Array<{ name: string }> } | null;
  canManageConversations: boolean;
  canDismissReviews: boolean;
};

export function DiscussionCard({
  selectedTab,
  onSelectTab,
  comments,
  reviews,
  reviewsSummary,
  speakerConversation,
  canManageConversations,
  canDismissReviews,
}: Props) {
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'comments' as const,
      label: t('event-management.proposal-page.discussion.tabs.comments'),
      icon: LockClosedIcon,
      count: comments.length,
      newCount: comments.filter((message) => message.isNew).length,
      panel: <CommentsPanel comments={comments} canManageConversations={canManageConversations} />,
    },
    reviews
      ? {
          id: 'reviews' as const,
          label: t('event-management.proposal-page.discussion.tabs.reviews'),
          icon: StarIcon,
          count: countActiveReviews(reviews),
          newCount: 0,
          panel: <ReviewsPanel reviews={reviews} summary={reviewsSummary} canDismissReviews={canDismissReviews} />,
        }
      : null,
    speakerConversation
      ? {
          id: 'speakers' as const,
          label: t('event-management.proposal-page.discussion.tabs.speakers'),
          icon: ChatBubbleLeftRightIcon,
          count: speakerConversation.messages.length,
          newCount: speakerConversation.messages.filter((message) => message.isNew).length,
          panel: (
            <SpeakersPanel
              messages={speakerConversation.messages}
              recipients={speakerConversation.recipients}
              canManageConversations={canManageConversations}
            />
          ),
        }
      : null,
  ].filter((tab) => tab !== null);

  const selectedIndex = Math.max(
    tabs.findIndex((tab) => tab.id === selectedTab),
    0,
  );

  return (
    <Card id="discussion-card">
      <TabGroup selectedIndex={selectedIndex} onChange={(index) => onSelectTab(tabs[index].id)}>
        <div className="border-b border-gray-200">
          <TabList className="-mb-px flex overflow-x-auto sm:gap-2 sm:px-4">
            {tabs.map(({ id, label, icon: Icon, count, newCount }) => (
              <Tab
                key={id}
                className="flex h-12 shrink-0 grow cursor-pointer items-center justify-center gap-1 border-b-2 border-transparent px-1.5 text-[13px] font-semibold whitespace-nowrap text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 data-selected:border-indigo-600 data-selected:text-indigo-600 sm:grow-0 sm:gap-2 sm:px-2 sm:text-sm"
              >
                <Icon className="size-4 max-sm:hidden" aria-hidden />
                {label}
                <span className="rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-700 max-[359px]:hidden sm:px-2">
                  {count}
                </span>
                {newCount > 0 ? (
                  <span className="flex items-center">
                    <StatusPill status="info" size="sm" />
                    <span className="sr-only">
                      {t('event-management.proposal-page.new-messages', { count: newCount })}
                    </span>
                  </span>
                ) : null}
              </Tab>
            ))}
          </TabList>
        </div>
        <TabPanels>
          {tabs.map(({ id, panel }) => (
            <TabPanel key={id}>{panel}</TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </Card>
  );
}

function Loading() {
  return (
    <Card aria-hidden>
      <div className="flex h-12 animate-pulse items-center gap-6 border-b border-gray-200 px-6">
        <div className="h-2.5 w-24 rounded-full bg-gray-200" />
        <div className="h-2.5 w-24 rounded-full bg-gray-200" />
      </div>
      <div className="flex animate-pulse gap-3 p-4">
        <div className="size-8 shrink-0 rounded-full bg-gray-200" />
        <div className="w-full space-y-2 rounded-md border border-gray-200 p-4">
          <div className="h-2.5 w-2/3 rounded-full bg-gray-200" />
          <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
          <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
        </div>
      </div>
    </Card>
  );
}

DiscussionCard.Loading = Loading;
