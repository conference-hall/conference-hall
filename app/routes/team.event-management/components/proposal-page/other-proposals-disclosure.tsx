import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { GlobalReviewNote } from '~/routes/components/reviews/review-note.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Text } from '~/shared/design-system/typography.tsx';

type OtherProposalsDisclosureProps = {
  proposals: Array<{
    id: string;
    title: string;
    review: number | null;
    speakers: Array<string>;
  }>;
};

export function OtherProposalsDisclosure({ proposals }: OtherProposalsDisclosureProps) {
  const { t } = useTranslation();

  if (proposals.length === 0) return null;

  return (
    <Card.Disclosure
      title={t('event-management.proposal-page.other-proposals', { count: proposals.length })}
      as="ul"
      defaultOpen={false}
    >
      {proposals.map((proposal) => (
        <li key={proposal.id}>
          <Link
            to={`../${proposal.id}`}
            target="_blank"
            relative="path"
            className="flex justify-between gap-4 hover:bg-gray-100 rounded-md w-full p-2"
          >
            <span>
              <Text weight="semibold">{proposal.title}</Text>
              <Text size="xs" variant="secondary">
                {t('common.by', { names: proposal.speakers })}
              </Text>
            </span>
            <GlobalReviewNote feeling="NEUTRAL" note={proposal.review} hideEmpty />
          </Link>
        </li>
      ))}
    </Card.Disclosure>
  );
}
