import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { LockClosedIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { CommentsPanel } from './comments-panel.tsx';
import type { ReviewMember, ReviewSummary } from './reviews-panel.tsx';
import { ReviewsPanel } from './reviews-panel.tsx';

export type DiscussionTab = 'comments' | 'reviews';

type Props = {
  selectedTab: DiscussionTab;
  onSelectTab: (tab: DiscussionTab) => void;
  comments: Array<Message>;
  reviews: Array<ReviewMember> | null;
  reviewsSummary: ReviewSummary | null;
  canManageConversations: boolean;
  canDismissReviews: boolean;
};

export function DiscussionCard({
  selectedTab,
  onSelectTab,
  comments,
  reviews,
  reviewsSummary,
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
      panel: <CommentsPanel comments={comments} canManageConversations={canManageConversations} />,
    },
    reviews
      ? {
          id: 'reviews' as const,
          label: t('event-management.proposal-page.discussion.tabs.reviews'),
          icon: StarIcon,
          count: reviews.filter((review) => review.dismissedAt === null).length,
          panel: <ReviewsPanel reviews={reviews} summary={reviewsSummary} canDismissReviews={canDismissReviews} />,
        }
      : null,
  ].filter((tab) => tab !== null);

  const selectedIndex = Math.max(
    tabs.findIndex((tab) => tab.id === selectedTab),
    0,
  );

  return (
    <Card>
      <TabGroup selectedIndex={selectedIndex} onChange={(index) => onSelectTab(tabs[index].id)}>
        <TabList className="flex gap-2 border-b border-gray-200 px-4">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <Tab
              key={id}
              className="-mb-px flex h-12 cursor-pointer items-center gap-2 border-b-2 border-transparent px-2 text-sm font-semibold text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 data-selected:border-indigo-600 data-selected:text-indigo-600"
            >
              <Icon className="size-4" aria-hidden />
              {label}
              <span className="rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-700">{count}</span>
            </Tab>
          ))}
        </TabList>
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
