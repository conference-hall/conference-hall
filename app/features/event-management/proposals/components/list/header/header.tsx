import { Trans, useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ReviewsProgress } from '../../shared/reviews-progress.tsx';
import { DeliberationButton } from './deliberation-button.tsx';

type Props = {
  checkboxRef: React.RefObject<HTMLInputElement | null>;
  total: number;
  totalSelected: number;
  totalReviewed: number;
  hasNewMessages: boolean;
  selection: string[];
  isAllPagesSelected: boolean;
};

export function ListHeader({
  checkboxRef,
  total,
  totalSelected,
  totalReviewed,
  hasNewMessages,
  selection,
  isAllPagesSelected,
}: Props) {
  const { t } = useTranslation();
  const permissions = useUserTeamPermissions();

  return (
    <List.Header className="py-2">
      <div className="flex flex-col gap-4 sm:h-7 md:flex-row md:items-center">
        {permissions.canChangeProposalStatus ? (
          <Checkbox aria-label={t('event-management.proposals.list.check-item')} ref={checkboxRef}>
            {totalSelected === 0 ? (
              <Trans
                i18nKey="event-management.proposals.list.items"
                values={{ count: total }}
                components={[<span key="0" className="font-semibold" />]}
              />
            ) : (
              t('event-management.proposals.list.selected', { count: totalSelected })
            )}
          </Checkbox>
        ) : (
          <Text>
            <Trans
              i18nKey="event-management.proposals.list.items"
              values={{ count: total }}
              components={[<span key="0" className="font-semibold" />]}
            />
          </Text>
        )}

        {totalSelected !== 0 && (
          <div className="flex items-center gap-2">
            <DeliberationButton
              status="ACCEPTED"
              selection={selection}
              isAllPagesSelected={isAllPagesSelected}
              totalSelected={totalSelected}
            />
            <DeliberationButton
              status="PENDING"
              selection={selection}
              isAllPagesSelected={isAllPagesSelected}
              totalSelected={totalSelected}
            />
            <DeliberationButton
              status="REJECTED"
              selection={selection}
              isAllPagesSelected={isAllPagesSelected}
              totalSelected={totalSelected}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {hasNewMessages && <NewMessagesPill />}
        <ReviewsProgress reviewed={totalReviewed} total={total} />
      </div>
    </List.Header>
  );
}

function NewMessagesPill() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const params = new URLSearchParams(searchParams);
  params.set('messages', 'new');
  params.delete('page');

  return (
    <Link
      to={{ search: params.toString() }}
      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
    >
      <StatusPill status="info" size="sm" ping />
      <span>{t('event-management.proposals.list.new-messages')}</span>
    </Link>
  );
}
