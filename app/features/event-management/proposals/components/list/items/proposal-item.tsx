import type { ChangeEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { href, Link, useSearchParams } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Badge, BadgeDot } from '~/design-system/badges.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { Tag } from '~/design-system/tag.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
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

  const {
    id,
    routeId,
    title,
    reviews,
    archivedAt,
    submittedAt,
    deliberationStatus,
    tags,
    speakers,
    commentCount,
    hasNewMessages,
  } = proposal;

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

            {canChangeProposalStatus && deliberationStatus !== 'PENDING' && (
              <>
                <DeliberationBadge {...proposal} />
                <PublicationBadge {...proposal} />
              </>
            )}

            {tags.map((tag) => (
              <Tag key={tag.id} tag={tag} isSearchLink={false} />
            ))}
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <Text size="xs" variant="secondary" className="space-x-1">
              <span>#{routeId}</span>
              {speakers.length ? (
                <Trans
                  as="span"
                  i18nKey="common.proposed-by"
                  values={{ names: speakers.map((a) => a.name) }}
                  components={[<span key="0" className="text-gray-800" />]}
                />
              ) : null}
              <ClientOnly>
                {() => <span>{`· ${formatDate(submittedAt, { format: 'medium', locale })}`}</span>}
              </ClientOnly>
            </Text>
            {hasNewMessages ? <NewMessagesIndicator /> : null}
          </div>
        </div>

        <ReviewSection reviews={reviews} commentCount={commentCount} />
      </Link>
    </>
  );
}

function DeliberationBadge({ deliberationStatus, confirmationStatus }: ProposalData) {
  const { t } = useTranslation();

  if (confirmationStatus) return null;

  switch (deliberationStatus) {
    case 'ACCEPTED':
      return (
        <BadgeDot pill compact color="green">
          {t('common.proposals.status.accepted')}
        </BadgeDot>
      );
    case 'REJECTED':
      return (
        <BadgeDot pill compact color="red">
          {t('common.proposals.status.rejected')}
        </BadgeDot>
      );
    case 'PENDING':
      return null;
  }
}

function NewMessagesIndicator() {
  const { t } = useTranslation();

  const label = t('event-management.proposals.list.new-messages');

  return (
    <Tooltip text={label} as="span" placement="right" hideArrow>
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
      </span>
      <span className="sr-only">{label}</span>
    </Tooltip>
  );
}

function PublicationBadge({ deliberationStatus, publicationStatus, confirmationStatus }: ProposalData) {
  const { t } = useTranslation();

  if (deliberationStatus === 'PENDING') return null;

  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED' && confirmationStatus === 'PENDING') {
    return (
      <BadgeDot pill compact color="blue">
        {t('common.proposals.status.not-answered')}
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'CONFIRMED'
  ) {
    return (
      <BadgeDot pill compact color="green">
        {t('common.proposals.status.confirmed')}
      </BadgeDot>
    );
  } else if (
    deliberationStatus === 'ACCEPTED' &&
    publicationStatus === 'PUBLISHED' &&
    confirmationStatus === 'DECLINED'
  ) {
    return (
      <BadgeDot pill compact color="red">
        {t('common.proposals.status.declined')}
      </BadgeDot>
    );
  } else if (publicationStatus === 'NOT_PUBLISHED') {
    return (
      <BadgeDot pill compact color="gray">
        {t('common.not-published')}
      </BadgeDot>
    );
  }
  return null;
}
