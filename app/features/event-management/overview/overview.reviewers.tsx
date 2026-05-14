import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowUturnLeftIcon, EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { AvatarName } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { CategoryBar } from '~/design-system/charts/category-bar.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { Text } from '~/design-system/typography.tsx';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { ReviewNote } from '../proposals/components/shared/review-note.tsx';
import type { Route } from './+types/overview.reviewers.ts';
import { ReviewerActions } from './services/reviewer-actions.server.ts';
import { ReviewersMetrics } from './services/reviewers-metrics.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const metrics = await ReviewersMetrics.for(authorizedEvent).get();
  return { metrics };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  const userId = String(form.get('userId'));

  switch (intent) {
    case 'dismiss-reviewer-reviews': {
      await ReviewerActions.for(authorizedEvent).dismissReviewsByUser(userId);
      break;
    }
    case 'restore-reviewer-reviews': {
      await ReviewerActions.for(authorizedEvent).restoreReviewsByUser(userId);
      break;
    }
  }
  return null;
};

export default function ReviewersTabRoute({ loaderData: { metrics } }: Route.ComponentProps) {
  const { t } = useTranslation();
  const permissions = useUserTeamPermissions();
  const { reviewersMetrics, proposalsCount } = metrics;

  if (reviewersMetrics.length === 0) {
    return <EmptyState label={t('event-management.overview.reviewers.empty')} icon={EyeSlashIcon} noBorder />;
  }

  return (
    <ul
      className="grid grid-cols-1 gap-8 px-6 md:grid-cols-2"
      aria-label={t('event-management.overview.reviewers.heading')}
    >
      {reviewersMetrics.map((reviewer, index) => {
        const reviewedReviews = reviewer.reviewsCount - reviewer.dismissedCount;
        const dismissedReviews = reviewer.dismissedCount;
        const remainingReviews = proposalsCount - reviewer.reviewsCount;

        return (
          <Card key={reviewer.id} as="li" aria-label={reviewer.name}>
            <div className="p-4">
              <div className="flex items-center justify-between pb-6">
                <div className="flex items-center gap-2">
                  <AvatarName name={reviewer.name} picture={reviewer.picture} size="xs" truncate />
                  <Text weight="medium" variant="secondary">
                    #{index + 1}
                  </Text>
                </div>
                <div>
                  {permissions.canDismissReviews && (
                    <ReviewerActionMenu
                      reviewerId={reviewer.id}
                      hasActive={reviewedReviews > 0}
                      hasDismissed={reviewer.dismissedCount > 0}
                    />
                  )}
                </div>
              </div>
              <div className="pb-2">
                <CategoryBar
                  values={[reviewedReviews, dismissedReviews, remainingReviews]}
                  colors={['bg-blue-400', 'bg-gray-400', 'bg-gray-400/20']}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-x-6">
                  {reviewedReviews > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-xs bg-blue-400" />
                      <Text>
                        {t('event-management.overview.reviewers.reviewed', {
                          percentage: Math.round((reviewedReviews / proposalsCount) * 100),
                        })}
                      </Text>
                    </div>
                  ) : null}

                  {dismissedReviews > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-xs bg-gray-400" />
                      <Text>
                        {t('event-management.overview.reviewers.dismissed', {
                          percentage: Math.round((dismissedReviews / proposalsCount) * 100),
                        })}
                      </Text>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-6">
                  <Tooltip text={t('event-management.overview.reviewers.negatives-count')} placement="bottom">
                    <ReviewNote feeling="NEGATIVE" note={reviewer.negativeCount} raw />
                  </Tooltip>
                  <Tooltip text={t('event-management.overview.reviewers.favorites-count')} placement="bottom">
                    <ReviewNote feeling="POSITIVE" note={reviewer.positiveCount} raw />
                  </Tooltip>
                  <Tooltip text={t('event-management.overview.reviewers.average-reviews')} placement="bottom">
                    <ReviewNote feeling="NEUTRAL" note={reviewer.averageNote} raw />
                  </Tooltip>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </ul>
  );
}

type ReviewerActionMenuProps = { reviewerId: string; hasActive: boolean; hasDismissed: boolean };

function ReviewerActionMenu({ reviewerId, hasActive, hasDismissed }: ReviewerActionMenuProps) {
  const { t } = useTranslation();

  const dismissFetcher = useFetcher({ key: `dismiss:${reviewerId}` });
  const handleDismiss = async () => {
    await dismissFetcher.submit(
      { intent: 'dismiss-reviewer-reviews', userId: reviewerId },
      { method: 'POST', preventScrollReset: true, flushSync: true },
    );
  };

  const restoreFetcher = useFetcher({ key: `restore:${reviewerId}` });
  const handleRestore = async () => {
    await restoreFetcher.submit(
      { intent: 'restore-reviewer-reviews', userId: reviewerId },
      { method: 'POST', preventScrollReset: true, flushSync: true },
    );
  };

  return (
    <Menu>
      <MenuButton as={Button} icon={EllipsisHorizontalIcon} variant="tertiary" size="xs" />

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()} modal={false}>
          {hasDismissed ? (
            <MenuItem as="button" onClick={handleRestore} className={menuItem()}>
              <ArrowUturnLeftIcon className={menuItemIcon()} aria-hidden="true" />
              {t('event-management.overview.reviewers.restore')}
            </MenuItem>
          ) : null}

          {hasActive ? (
            <MenuItem as="button" onClick={handleDismiss} className={menuItem({ variant: 'important' })}>
              <XMarkIcon className={menuItemIcon({ variant: 'important' })} aria-hidden="true" />
              {t('event-management.overview.reviewers.dismiss')}
            </MenuItem>
          ) : null}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
