import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventSpeakers } from '~/features/event-management/speakers/services/event-speakers.server.ts';
import { TalkForm } from '~/features/speaker/talk-library/components/talk-forms/talk-form.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { SpeakerEmailAlreadyExistsError } from '~/shared/errors.server.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import { EventSpeakerSaveSchema } from '~/shared/types/speaker.types.ts';
import type { Route } from './+types/new-proposal.ts';
import { CategoriesPanel } from './components/form-panels/categories-panel.tsx';
import { FormatsPanel } from './components/form-panels/formats-panel.tsx';
import { SpeakersPanel } from './components/form-panels/speakers-panel.tsx';
import { TagsPanel } from './components/form-panels/tags-panel.tsx';
import { ProposalCreationSchema } from './services/proposal-management.schema.server.ts';
import { ProposalManagement } from './services/proposal-management.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const proposalManagement = ProposalManagement.for(userId, params.team, params.event);
  await proposalManagement.canCreate();

  const url = new URL(request.url);
  const speakerId = url.searchParams.get('speaker');

  if (speakerId) {
    try {
      const eventSpeakers = EventSpeakers.for(userId, params.team, params.event);
      const speaker = await eventSpeakers.getById(speakerId);
      if (speaker) {
        return {
          preselectedSpeaker: {
            value: speaker.id,
            label: speaker.name,
            picture: speaker.picture,
            data: { description: speaker.company },
          },
        };
      }
    } catch {
      // If speaker not found, ignore and continue without preselection
    }
  }
  return null;
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'create-proposal': {
      const result = parseWithZod(form, { schema: ProposalCreationSchema });
      if (result.status !== 'success') return { errors: result.error };

      try {
        const proposal = await ProposalManagement.for(userId, params.team, params.event).create(result.value);
        const headers = await toastHeaders('success', i18n.t('event-management.proposals.new.feedbacks.created'));
        return redirect(href('/team/:team/:event/reviews/:proposal', { ...params, proposal: proposal.id }), {
          headers,
        });
      } catch (_error) {
        return toast('error', i18n.t('error.global'));
      }
    }
    case 'create-speaker': {
      const result = parseWithZod(form, { schema: EventSpeakerSaveSchema });
      if (result.status !== 'success') return { errors: result.error };

      try {
        const speaker = await EventSpeakers.for(userId, params.team, params.event).create(result.value);
        return { speaker };
      } catch (error) {
        if (error instanceof SpeakerEmailAlreadyExistsError) {
          return { errors: { email: [i18n.t('event-management.speakers.new.errors.email-already-exists')] } };
        }
        return toast('error', i18n.t('error.global'));
      }
    }
  }
};

export default function NewProposalRoute({ actionData, params, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team, event } = useCurrentEventTeam();
  const formId = useId();
  const preselectedSpeaker = loaderData?.preselectedSpeaker;

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
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="md:col-span-2">
          <Card.Content>
            <TalkForm id={formId} errors={actionData?.errors} />
          </Card.Content>

          <Card.Actions>
            <ButtonLink variant="secondary" to={href('/team/:team/:event/reviews', params)}>
              {t('common.cancel')}
            </ButtonLink>
            <Button type="submit" form={formId} name="intent" value="create-proposal">
              {t('common.submit')}
            </Button>
          </Card.Actions>
        </Card>

        <div className="row-start-1 md:row-auto">
          <Card as="section">
            <SpeakersPanel
              team={params.team}
              event={params.event}
              form={formId}
              error={actionData?.errors?.speakers}
              canChangeSpeakers
              canCreateSpeaker={team.userPermissions?.canCreateEventSpeaker}
              canEditSpeaker={team.userPermissions?.canEditEventSpeaker}
              value={preselectedSpeaker ? [preselectedSpeaker] : undefined}
              className="space-y-3 p-4 lg:px-6"
            />

            {hasFormats ? (
              <>
                <Divider />
                <FormatsPanel
                  team={params.team}
                  event={params.event}
                  form={formId}
                  error={actionData?.errors?.formats}
                  options={event.formats.map((f) => ({ value: f.id, label: f.name }))}
                  multiple={event.formatsAllowMultiple}
                  className="space-y-3 p-4 lg:px-6"
                />
              </>
            ) : null}

            {hasCategories ? (
              <>
                <Divider />
                <CategoriesPanel
                  team={params.team}
                  event={params.event}
                  form={formId}
                  error={actionData?.errors?.categories}
                  options={event.categories.map((c) => ({ value: c.id, label: c.name }))}
                  multiple={event.categoriesAllowMultiple}
                  className="space-y-3 p-4 lg:px-6"
                />
              </>
            ) : null}

            <Divider className="hidden md:block" />
            <TagsPanel
              team={params.team}
              event={params.event}
              form={formId}
              options={event.tags.map((c) => ({ value: c.id, label: c.name, color: c.color }))}
              className="hidden md:block space-y-3 p-4 pb-6 lg:px-6"
            />
          </Card>
        </div>
      </div>
    </Page>
  );
}
