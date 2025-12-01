import { useTranslation } from 'react-i18next';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
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
  selection: string[];
  isAllPagesSelected: boolean;
};

export function ListHeader({ checkboxRef, total, totalSelected, totalReviewed, selection, isAllPagesSelected }: Props) {
  const { t } = useTranslation();
  const permissions = useUserTeamPermissions();

  return (
    <List.Header className="sm:h-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center ">
        {permissions.canChangeProposalStatus ? (
          <Checkbox aria-label={t('event-management.proposals.list.check-item')} ref={checkboxRef}>
            {totalSelected === 0
              ? t('event-management.proposals.list.items', { count: total })
              : t('event-management.proposals.list.selected', { count: totalSelected })}
          </Checkbox>
        ) : (
          <Text weight="medium">{t('event-management.proposals.list.items', { count: total })}</Text>
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
      <ReviewsProgress reviewed={totalReviewed} total={total} />
    </List.Header>
  );
}
