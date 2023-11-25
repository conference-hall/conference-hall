import { parse } from '@conform-to/zod';
import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { UserProposal } from '~/domains/submissions-management/UserProposal.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection.tsx';
import { ProposalStatusSection } from '~/routes/__components/proposals/ProposalStatusSection.tsx';
import { ProposalParticipationSchema } from '~/routes/__types/proposal.ts';

import { useEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await UserProposal.for(userId, params.proposal).get();
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = UserProposal.for(userId, params.proposal);

  const form = await request.formData();
  const action = form.get('_action');
  switch (action) {
    case 'delete': {
      await proposal.delete();
      return redirectWithToast(`/${params.event}/proposals`, 'success', 'Proposal submission removed.');
    }
    case 'confirm': {
      const result = parse(form, { schema: ProposalParticipationSchema });
      if (!result.value) return null;
      await proposal.confirm(result.value.participation);
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
        <div className="space-y-4 lg:space-y-6">
          <ProposalStatusSection proposal={proposal} event={event} />
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
      </PageContent>
    </>
  );
}
