import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Publication } from '~/.server/publications/publication.ts';
import { PublishResultFormSchema } from '~/.server/publications/publication.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { BadRequestError } from '~/libs/errors.server.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';

import { PublicationConfirm } from './__components/publication-confirm.tsx';
import { useStatistics } from './__components/useStatistics.tsx';

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
  const result = parseWithZod(form, { schema: PublishResultFormSchema });
  if (result.status !== 'success') throw new BadRequestError('Invalid form data');

  await Publication.for(userId, params.team, params.event).publishAll('REJECTED', result.value.sendEmails);

  return redirectWithToast(
    `/team/${params.team}/${params.event}/publication`,
    'success',
    'Rejected proposal published.',
  );
};

export default function PublishRejectedModalRoute() {
  const statistics = useStatistics();
  return <PublicationConfirm title="Rejected proposals publication" statistics={statistics.rejected} />;
}
