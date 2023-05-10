import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { ProposalStatus } from '@prisma/client';
import { useParams, useSearchParams } from '@remix-run/react';
import format from 'date-fns/format';
import { ClientOnly } from 'remix-utils';
import { ButtonLink } from '~/design-system/Buttons';
import { H2, Text } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';
import { ProposalStatusBadge } from '~/shared-components/proposals/ProposalStatusBadges';
import { formatRating } from '~/utils/ratings';

type Props = {
  review?: {
    average: number | null;
    positives: number;
    negatives: number;
  };
  status: ProposalStatus;
  comments: string | null;
  submittedAt: string;
};

export function ReviewInfoSection({ review, status, comments, submittedAt }: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <Card as="section" p={4} className="space-y-6">
      <H2 size="base">Informations</H2>

      {review && (
        <div className="flex items-center justify-between">
          <Text size="s" strong>
            Global review
          </Text>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <XCircleIcon className="h-4 w-4" />
              <Text size="s" strong>
                {review?.negatives}
              </Text>
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              <Text size="s" strong>
                {review?.positives}
              </Text>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4" />
              <Text size="s" strong>
                {formatRating(review?.average)}
              </Text>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <Text size="s" strong>
          Proposal status
        </Text>
        <ProposalStatusBadge status={status} />
      </div>

      <div className="flex justify-between gap-2">
        <Text size="s" strong>
          Submission date
        </Text>
        <ClientOnly>{() => <Text size="s">{format(new Date(submittedAt), 'PPP')}</Text>}</ClientOnly>
      </div>

      {comments && (
        <div className="flex flex-col gap-2">
          <Text size="s" strong>
            Submission message
          </Text>
          <div className="rounded bg-gray-50 p-2 italic">
            <Text size="xs">{comments}</Text>
          </div>
        </div>
      )}

      <ButtonLink
        to={{
          pathname: `/organizer/${params.orga}/${params.event}/review/${params.proposal}/edit`,
          search: searchParams.toString(),
        }}
        variant="secondary"
        iconLeft={PencilSquareIcon}
        block
      >
        Edit proposal
      </ButtonLink>
    </Card>
  );
}
