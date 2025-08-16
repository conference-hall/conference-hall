import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { TalkForm } from '~/features/speaker/talk-library/components/talk-forms/talk-form.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/new-proposal.ts';
import { CategoriesPanel } from './components/form-panels/categories-panel.tsx';
import { FormatsPanel } from './components/form-panels/formats-panel.tsx';
import { SpeakersPanel } from './components/form-panels/speakers-panel.tsx';
import { TagsPanel } from './components/form-panels/tags-panel.tsx';
import { TalkProposalCreationSchema } from './services/proposal-management.schema.server.ts';
import { ProposalManagement } from './services/proposal-management.server.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkProposalCreationSchema });
  if (result.status !== 'success') return { errors: result.error }; // todo(proposal): display errors

  try {
    const proposal = await ProposalManagement.for(userId, params.team, params.event).create(result.value);
    const headers = await toastHeaders('success', t('event-management.proposals.new.feedbacks.created'));
    return redirect(href('/team/:team/:event/reviews/:proposal', { ...params, proposal: proposal.id }), { headers });
  } catch (_error) {
    return { errors: { form: t('error.global') } };
  }
};

// todo(proposal): make it responsive
export default function NewProposalRoute({ actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team, event } = useCurrentEventTeam();
  const formId = useId();

  if (!isFeatureEnabled || !team.userPermissions?.canCreateEventProposal) {
    return null;
  }

  const hasFormats = event.formats && event.formats.length > 0;
  const hasCategories = event.categories && event.categories.length > 0;

  return (
    <Page>
      <Page.Heading
        title={t('event-management.proposals.new.title')}
        subtitle={t('event-management.proposals.new.subtitle')}
        backTo={href('/team/:team/:event/reviews', params)}
      />

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <Card.Content>
            <TalkForm id={formId} errors={actionData?.errors} />
          </Card.Content>

          <Card.Actions>
            <ButtonLink variant="secondary" to={href('/team/:team/:event/reviews', params)}>
              {t('common.cancel')}
            </ButtonLink>
            <Button type="submit" form={formId}>
              {t('common.submit')}
            </Button>
          </Card.Actions>
        </Card>

        <div>
          <Card as="section">
            <SpeakersPanel
              team={params.team}
              event={params.event}
              form={formId}
              error={actionData?.errors?.speakers}
              className="space-y-3 p-4 lg:px-6"
            />

            <Divider />

            {hasFormats ? (
              <>
                <FormatsPanel
                  team={params.team}
                  event={params.event}
                  form={formId}
                  error={actionData?.errors?.formats}
                  options={event.formats.map((f) => ({ value: f.id, label: f.name }))}
                  multiple={event.formatsAllowMultiple}
                  className="space-y-3 p-4 lg:px-6"
                />
                <Divider />
              </>
            ) : null}

            {hasCategories ? (
              <>
                <CategoriesPanel
                  team={params.team}
                  event={params.event}
                  form={formId}
                  error={actionData?.errors?.categories}
                  options={event.categories.map((c) => ({ value: c.id, label: c.name }))}
                  multiple={event.categoriesAllowMultiple}
                  className="space-y-3 p-4 lg:px-6"
                />
                <Divider />
              </>
            ) : null}

            <TagsPanel
              team={params.team}
              event={params.event}
              form={formId}
              options={event.tags.map((c) => ({ value: c.id, label: c.name, color: c.color }))}
              className="space-y-3 p-4 pb-6 lg:px-6"
            />
          </Card>
        </div>
      </div>
    </Page>
  );
}
