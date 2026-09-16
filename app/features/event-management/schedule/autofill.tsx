import { parseWithZod } from '@conform-to/zod/v4';
import { useLocation, useNavigate } from 'react-router';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/autofill.ts';
import { AutofillPanel } from './components/autofill/autofill-panel.tsx';
import { AutofillScopeSchema } from './services/autofill.schema.server.ts';
import { ScheduleAutofill } from './services/autofill.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);

  return ScheduleAutofill.for(authorizedEvent).get();
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const i18n = getI18n(context);
  const authorizedEvent = context.get(AuthorizedEventContext);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: AutofillScopeSchema });
  if (result.status !== 'success') return toast('error', i18n.t('error.global'));

  const report = await ScheduleAutofill.for(authorizedEvent).run(result.value);
  return { report };
};

export default function ScheduleAutofillRoute({ loaderData: payload, actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => navigate({ pathname: '..', search: location.search });

  return <AutofillPanel payload={payload} report={actionData?.report ?? null} onClose={close} />;
}
