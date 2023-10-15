import { parse } from '@conform-to/zod';
import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection.tsx';
import { ProposalStatusSection } from '~/routes/__components/proposals/ProposalStatusSection.tsx';
import { getSpeakerProposal } from '~/routes/__server/proposals/get-speaker-proposal.server.ts';
import { ProposalParticipationSchema } from '~/routes/__types/proposal.ts';

import { deleteProposal } from './__server/delete-proposal.server.ts';
import { sendParticipationAnswer } from './__server/send-participation-answer.server.ts';
import { useEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await getSpeakerProposal(params.proposal, userId);
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'delete': {
      await deleteProposal(params.proposal, userId);
      return redirectWithToast(`/${params.event}/proposals`, 'success', 'Proposal submission removed.');
    }
    case 'confirm': {
      const result = parse(form, { schema: ProposalParticipationSchema });
      if (!result.value) return null;
      await sendParticipationAnswer(userId, params.proposal, result.value.participation);
      return toast('success', 'Your response has been sent to organizers.');
    }
    default:
      return null;
  }
};

export default function ProposalRoute() {
  const { event } = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeaderTitle title={proposal.title} backOnClick={() => navigate(-1)} />

      <PageContent>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
          <div className="lg:col-span-1 lg:col-start-3">
            <ProposalStatusSection proposal={proposal} event={event} />
          </div>
          <div className="lg:col-span-2 lg:col-start-1">
            <ProposalDetailsSection
              abstract={proposal.abstract}
              references={proposal.references}
              formats={proposal.formats}
              categories={proposal.categories}
              level={proposal.level}
              languages={proposal.languages}
              speakers={proposal.speakers}
            />
          </div>
        </div>
      </PageContent>
    </>
  );
}
