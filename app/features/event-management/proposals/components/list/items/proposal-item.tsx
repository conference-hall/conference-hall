import type { ChangeEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { href, Link, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { Join } from '~/design-system/join.tsx';
import { Tag } from '~/design-system/tag.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { useHydrated } from '~/design-system/utils/use-hydrated.ts';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import type { ProposalData } from '../../shared/types.ts';
import { ReviewSection } from './review-section.tsx';

type ProposalItemProps = {
  team: string;
  event: string;
  proposal: ProposalData;
  queryParams?: string;
  isSelected?: boolean;
  isAllPagesSelected?: boolean;
  toggle?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProposalItem({
  team,
  event,
  proposal,
  queryParams,
  isSelected = false,
  isAllPagesSelected = false,
  toggle,
}: ProposalItemProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [currentQueryParams] = useSearchParams();
  const { canChangeProposalStatus } = useUserTeamPermissions();
  const hydrated = useHydrated();
  const proposalStatus = useProposalStatus(proposal, canChangeProposalStatus);

  const { id, routeId, title, reviews, archivedAt, submittedAt, tags, speakers, commentCount, hasNewMessages } =
    proposal;

  const pathname = href('/team/:team/:event/proposals/:proposal', {
    team,
    event,
    proposal: routeId,
  });

  return (
    <>
      {canChangeProposalStatus && toggle ? (
        <Checkbox
          aria-label={t('event-management.proposals.list.select-item', { title })}
          value={id}
          checked={isSelected}
          disabled={isAllPagesSelected || archivedAt !== null}
          onChange={toggle}
          className="self-start pt-3.75 pr-4"
        />
      ) : undefined}

      <Link
        to={{ pathname, search: queryParams || currentQueryParams.toString() }}
        aria-label={t('event-management.proposals.list.open', { title })}
        className="flex min-w-0 grow flex-col gap-4 py-3 hover:text-indigo-700 md:flex-row md:items-center md:justify-between"
      >
        <div className="min-w-0 space-y-2 md:space-y-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold">{title}</span>

            {archivedAt ? <Badge pill>{t('common.archived')}</Badge> : null}

            {tags.map((tag) => (
              <Tag key={tag.id} tag={tag} isSearchLink={false} />
            ))}
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-1">
            <Join by={<Subtitle className="hidden sm:inline">·</Subtitle>}>
              {speakers.length > 0 ? (
                <Text size="xs" variant="secondary">
                  <Trans
                    i18nKey="common.proposed-by"
                    values={{ routeId, names: speakers.map((a) => a.name) }}
                    components={[<span key="0" className="text-gray-800" />]}
                  />
                </Text>
              ) : null}
              {hydrated ? (
                <Text size="xs" variant="secondary">
                  {formatDate(submittedAt, { format: 'medium', locale })}
                </Text>
              ) : null}
              {proposalStatus ? <Text size="xs">{proposalStatus}</Text> : null}
            </Join>

            {hasNewMessages ? <NewMessagesIndicator /> : null}
          </div>
        </div>

        <ReviewSection reviews={reviews} commentCount={commentCount} />
      </Link>
    </>
  );
}

function NewMessagesIndicator() {
  const { t } = useTranslation();
  const label = t('event-management.proposals.list.new-messages');

  return (
    <Tooltip text={label} as="span" placement="right" hideArrow>
      <StatusPill status="info" size="sm" className="ml-1.5" />
      <span className="sr-only">{label}</span>
    </Tooltip>
  );
}

function useProposalStatus(proposal: ProposalData, canChangeProposalStatus: boolean): string | null {
  const { t } = useTranslation();
  const { deliberationStatus, confirmationStatus } = proposal;

  if (!canChangeProposalStatus) {
    return null;
  }
  if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'PENDING') {
    return t('common.proposals.status.not-answered');
  }
  if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'CONFIRMED') {
    return t('common.proposals.status.confirmed');
  }
  if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'DECLINED') {
    return t('common.proposals.status.declined');
  }
  if (deliberationStatus === 'ACCEPTED') {
    return t('common.proposals.status.accepted');
  }
  if (deliberationStatus === 'REJECTED') {
    return t('common.proposals.status.rejected');
  }
  return null;
}
