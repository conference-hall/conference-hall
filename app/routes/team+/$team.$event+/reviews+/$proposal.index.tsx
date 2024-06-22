import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/UserEvent.ts';
import { Publication } from '~/.server/publications/Publication.ts';
import { ActivityFeed } from '~/.server/reviews/ActivityFeed.ts';
import { Comments } from '~/.server/reviews/Comments.ts';
import { Deliberate, DeliberateSchema } from '~/.server/reviews/Deliberate.ts';
import type { ProposalReviewData } from '~/.server/reviews/ProposalReview.ts';
import { ProposalReview } from '~/.server/reviews/ProposalReview.ts';
import { ProposalUpdateSchema, ReviewUpdateDataSchema } from '~/.server/reviews/ProposalReview.types.ts';
import { parseUrlFilters } from '~/.server/shared/ProposalSearchBuilder.types.ts';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { TalkSection } from '~/routes/__components/talks/talk-section.tsx';
import { useUser } from '~/routes/__components/useUser.tsx';

import { ProposalActivityFeed as Feed } from './__components/proposal-activity/proposal-activity-feed';
import { ReviewHeader } from './__components/review-header';
import { ReviewSidebar } from './__components/review-sidebar';

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
    case 'edit-talk': {
      const result = parseWithZod(form, ProposalUpdateSchema);
      if (!result.success) return json(result.error);

      const proposal = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await proposal.update(result.value);
      return toast('success', 'Proposal saved.');
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute() {
  const params = useParams();
  const { user } = useUser();
  const { event, proposal, pagination, activity } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const role = user?.teams.find((team) => team.slug === params.team)?.role;
  const canEdit = role !== 'REVIEWER';
  const canDeliberate = role !== 'REVIEWER';

  const hasFormats = proposal.formats && proposal.formats.length > 0;
  const hasCategories = proposal.categories && proposal.categories.length > 0;

  return (
    <Page>
      <ReviewHeader {...pagination} />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="space-y-4 lg:col-span-7">
            <TalkSection
              talk={proposal}
              errors={errors}
              event={event}
              canEditTalk={canEdit}
              canEditSpeakers={false}
              canArchive={false}
              showFormats={hasFormats}
              showCategories={hasCategories}
              referencesOpen
            />
            <Feed activity={activity} />
          </div>

          <div className="lg:col-span-3">
            <ReviewSidebar proposal={proposal} reviewEnabled={event.reviewEnabled} canDeliberate={canDeliberate} />
          </div>
        </div>
      </div>
    </Page>
  );
}
