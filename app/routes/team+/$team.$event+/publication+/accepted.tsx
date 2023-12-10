import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/domains/organizer-event-settings/UserEvent';
import { Publication } from '~/domains/proposal-publication/Publication';
import { PublishResultFormSchema } from '~/domains/proposal-publication/Publication.types';
import { requireSession } from '~/libs/auth/session.ts';
import { BadRequestError } from '~/libs/errors';
import { redirectWithToast } from '~/libs/toasts/toast.server';

import { PublicationConfirm } from './__components/publication-confirm';
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

  await Publication.for(userId, params.team, params.event).publishAll('ACCEPTED', result.value.sendEmails);

  return redirectWithToast(
    `/team/${params.team}/${params.event}/publication`,
    'success',
    'Accepted proposal published.',
  );
};

export default function PublishAcceptedModalRoute() {
  const statistics = useResultsStatistics();
  return <PublicationConfirm title="Accepted proposals publication" statistics={statistics.accepted} />;
}
