import { useTranslation } from 'react-i18next';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { Checkbox } from '~/shared/design-system/forms/checkboxes.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { Text } from '~/shared/design-system/typography.tsx';
import { DeliberationButton } from '../actions/deliberation-button.tsx';
import { ReviewsProgress } from './reviews-progress.tsx';

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
  const currentTeam = useCurrentTeam();

  return (
    <List.Header className="sm:h-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center ">
        {currentTeam.userPermissions.canChangeProposalStatus ? (
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
