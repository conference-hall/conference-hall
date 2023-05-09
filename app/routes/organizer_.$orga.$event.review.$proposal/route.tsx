import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { Outlet, useLoaderData, useOutletContext, useParams, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalRatingDataSchema, ProposalsFiltersSchema } from '~/schemas/proposal';
import type { ProposalReview } from './server/get-proposal-review.server';
import { getProposalReview } from './server/get-proposal-review.server';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { useUser } from '~/root';
import { ReviewHeader } from './components/Header';
import { Card } from '~/design-system/layouts/Card';
import { H2, Text } from '~/design-system/Typography';
import { ReviewTabs } from './components/Tabs';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { formatRating } from '~/utils/ratings';
import { ProposalStatusBadge } from '~/shared-components/proposals/ProposalStatusBadges';
import { rateProposal } from './server/rate-proposal.server';
import { RatingButtons } from './components/RatingButtons';
import { ButtonLink } from '~/design-system/Buttons';
import { PencilSquareIcon } from '@heroicons/react/20/solid';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const url = new URL(request.url);
  const filters = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const proposal = await getProposalReview(params.event, params.proposal, userId, filters.data ?? {});
  return json(proposal);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const result = await withZod(ProposalRatingDataSchema).validate(form);
  if (result.data) {
    await rateProposal(params.event, params.proposal, userId, result.data);
  }
  return null;
};

export default function ProposalReviewRoute() {
  const { user } = useUser();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const proposalReview = useLoaderData<typeof loader>();
  const { proposal, pagination } = proposalReview;

  return (
    <>
      <Navbar user={user} withSearch />

      <ReviewHeader title={proposal.title} pagination={pagination} />

      <div className="flex gap-8 px-8 py-8">
        <section className="flex-1 space-y-4">
          <ReviewTabs
            speakersCount={proposal.speakers.length}
            reviewsCount={proposal.ratings.members.length}
            messagesCount={proposal.messages.length}
            displayReviews={Boolean(proposal.ratings.summary)}
          />

          <Outlet context={{ user, proposalReview }} />
        </section>

        <section className="w-1/4 space-y-4">
          <Card p={4} className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
              <H2 size="base">Your review</H2>
              <div className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1">
                {proposal.ratings.you.feeling === 'POSITIVE' ? (
                  <HeartIcon className="h-4 w-4" />
                ) : proposal.ratings.you.feeling === 'NEGATIVE' ? (
                  <XCircleIcon className="h-4 w-4" />
                ) : (
                  <StarIcon className="h-4 w-4" />
                )}
                <Text size="base" heading strong>
                  {formatRating(proposal.ratings.you.rating)}
                </Text>
              </div>
            </div>
            <RatingButtons userRating={proposal.ratings.you} />
          </Card>

          <Card p={4} className="space-y-6">
            <H2 size="base">Informations</H2>
            {proposal.ratings.summary && (
              <div className="flex items-center justify-between">
                <Text size="s" strong>
                  Global review
                </Text>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <XCircleIcon className="h-4 w-4" />
                    <Text size="s" strong>
                      {proposal.ratings.summary?.negatives}
                    </Text>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4" />
                    <Text size="s" strong>
                      {proposal.ratings.summary?.positives}
                    </Text>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4" />
                    <Text size="s" strong>
                      {formatRating(proposal.ratings.summary?.average)}
                    </Text>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Text size="s" strong>
                Submission date
              </Text>
              <Text size="s">10/02/2023</Text>
            </div>
            <div className="flex justify-between gap-2">
              <Text size="s" strong>
                Proposal status
              </Text>
              <ProposalStatusBadge status={proposal.status} />
            </div>
            {proposal.comments && (
              <div className="flex flex-col gap-2">
                <Text size="s" strong>
                  Speaker message
                </Text>
                <Text size="s">{proposal.comments}</Text>
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
        </section>
      </div>
    </>
  );
}

export function useProposalReview() {
  return useOutletContext<{ proposalReview: ProposalReview }>();
}
