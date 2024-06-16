import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/UserEvent.ts';
import { ActivityFeed } from '~/.server/proposal-reviews/ActivityFeed.ts';
import { Comments } from '~/.server/proposal-reviews/Comments.ts';
import { Deliberate, DeliberateSchema } from '~/.server/proposal-reviews/Deliberate.ts';
import type { ProposalReviewData } from '~/.server/proposal-reviews/ProposalReview.ts';
import { ProposalReview } from '~/.server/proposal-reviews/ProposalReview.ts';
import { Publication } from '~/.server/publications/Publication.ts';
import { ReviewUpdateDataSchema } from '~/.server/reviews/ProposalReview.types.ts';
import { parseUrlFilters } from '~/.server/shared/ProposalSearchBuilder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';
import { useUser } from '~/routes/__components/useUser.tsx';

import { ActivityFeed as Feed } from './__components/activity-feed.tsx';
import { ProposalPage } from './__components/proposal-page.tsx';
import { ReviewHeader } from './__components/review-header.tsx';
import { ReviewSidebar } from './__components/review-sidebar.tsx';

export type ProposalData = ProposalReviewData;

export const meta = mergeMeta(() => [{ title: `Review proposal | Conference Hall` }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const event = await UserEvent.for(userId, params.team, params.event).get();

  const filters = parseUrlFilters(request.url);
  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const proposal = await review.get();
  const pagination = await review.getPreviousAndNextReviews(filters);

  const activity = await ActivityFeed.for(userId, params.team, params.event, params.proposal).activity();

  return json({ event, proposal, activity, pagination });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'add-review': {
      const result = parseWithZod(form, ReviewUpdateDataSchema);
      if (!result.success) return toast('error', 'Something went wrong.' + JSON.stringify(result.error));
      const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await review.addReview(result.value);
      break;
    }
    case 'add-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const comment = form.get('comment');
      if (comment) await discussions.add(comment.toString());
      break;
    }
    case 'delete-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const commentId = form.get('commentId');
      if (commentId) await discussions.remove(commentId.toString());
      break;
    }
    case 'change-deliberation-status': {
      const result = parseWithZod(form, DeliberateSchema);
      if (!result.success) return toast('error', 'Something went wrong.');
      const deliberate = Deliberate.for(userId, params.team, params.event);
      await deliberate.mark([params.proposal], result.value.status);
      break;
    }
    case 'publish-results': {
      const result = Publication.for(userId, params.team, params.event);
      await result.publish(params.proposal, form.get('send-email') === 'on');
      break;
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute() {
  const params = useParams();
  const { user } = useUser();
  const { event, proposal, pagination, activity } = useLoaderData<typeof loader>();

  const role = user?.teams.find((team) => team.slug === params.team)?.role;
  const canDeliberate = role !== 'REVIEWER';

  return (
    <>
      <Navbar user={user} withSearch />

      <ReviewHeader {...pagination} />

      <div className="mx-auto max-w-7xl p-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="space-y-4 lg:col-span-7">
            <ProposalPage proposal={proposal} />
            <Feed activity={activity} />
            <Outlet context={{ event, proposal }} />
          </div>

          <div className="lg:col-span-3">
            <ReviewSidebar proposal={proposal} reviewEnabled={event.reviewEnabled} canDeliberate={canDeliberate} />
          </div>
        </div>
      </div>
    </>
  );
}
