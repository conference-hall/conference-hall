import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserProposal } from '~/.server/cfp-submissions/UserProposal.ts';
import { ProposalParticipationSchema } from '~/.server/cfp-submissions/UserProposal.types.ts';
import { Page } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';
import { ProposalDetailsSection } from '~/routes/__components/proposals/ProposalDetailsSection.tsx';
import { ProposalStatusSection } from '~/routes/__components/proposals/ProposalStatusSection.tsx';

import { useEvent } from './__components/useEvent.tsx';

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
      const result = parseWithZod(form, ProposalParticipationSchema);
      if (!result.success) return null;
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

      <Page>
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
      </Page>
    </>
  );
}
