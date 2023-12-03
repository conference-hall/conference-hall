import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ResultsAnnouncement } from '~/domains/organizer-cfp-results/ResultsAnnouncement';
import { PublishResultFormSchema } from '~/domains/organizer-cfp-results/ResultsAnnouncement.types';
import { UserEvent } from '~/domains/organizer-event-settings/UserEvent';
import { requireSession } from '~/libs/auth/session.ts';
import { BadRequestError } from '~/libs/errors';
import { redirectWithToast } from '~/libs/toasts/toast.server';

import { AnnoucementConfirmModal } from './__components/AnnoucementConfirmModal';
import { useResultsStatistics } from './_layout';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  await UserEvent.for(userId, params.team, params.event).allowedFor(['OWNER', 'MEMBER']);
  return json(null);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: PublishResultFormSchema });
  if (!result.value) throw new BadRequestError('Invalid form data');

  await ResultsAnnouncement.for(userId, params.team, params.event).publishAll('ACCEPTED', result.value.sendEmails);

  return redirectWithToast(`/team/${params.team}/${params.event}/results`, 'success', 'Accepted proposal published.');
};

export default function ResultsAcceptedModalRoute() {
  const statistics = useResultsStatistics('accepted');
  return <AnnoucementConfirmModal title="Accepted proposals announcement" statistics={statistics} />;
}
