import { parseWithZod } from '@conform-to/zod';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form, useParams } from 'react-router';
import { z } from 'zod';
import { EventIntegrations } from '~/.server/event-settings/event-integrations.ts';
import {
  OpenPlannerConfigSchema,
  UpdateIntegrationConfigSchema,
} from '~/.server/event-settings/event-integrations.types.ts';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { EventSlackSettingsSchema } from '~/.server/event-settings/user-event.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useFlag } from '~/routes/components/contexts/flags-context.tsx';
import type { Route } from './+types/integrations.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventIntegrations = EventIntegrations.for(userId, params.team, params.event);
  const integrations = await eventIntegrations.getConfigurations();
  return integrations;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-slack-integration': {
      const result = parseWithZod(form, { schema: EventSlackSettingsSchema });
      if (result.status !== 'success') return result.error;

      const event = UserEvent.for(userId, params.team, params.event);
      await event.update(result.value);
      break;
    }
    case 'save-integration': {
      const resultConfig = parseWithZod(form, { schema: UpdateIntegrationConfigSchema });
      if (resultConfig.status !== 'success') return resultConfig.error;

      const eventIntegrations = EventIntegrations.for(userId, params.team, params.event);
      if (resultConfig.value.name === 'OPEN_AI') {
        const { id, name, ...configuration } = resultConfig.value;
        await eventIntegrations.save({ id, name, configuration });
      } else if (resultConfig.value.name === 'OPEN_PLANNER') {
        const { id, name, ...configuration } = resultConfig.value;
        await eventIntegrations.save({ id, name, configuration });
      }
      return toast('success', t('event-management.settings.integrations.feedbacks.saved'));
    }
    case 'check-open-planner-integration': {
      const resultId = parseWithZod(form, { schema: z.object({ id: z.string().optional() }) });
      if (resultId.status !== 'success') return toast('error', t('error.global'));

      const resultConfig = parseWithZod(form, { schema: OpenPlannerConfigSchema });
      if (resultConfig.status !== 'success') return resultConfig.error;

      const eventIntegrations = EventIntegrations.for(userId, params.team, params.event);
      const data = { id: resultId.value.id, name: 'OPEN_PLANNER', configuration: resultConfig.value } as const;
      const result = await eventIntegrations.checkConfiguration(data);

      if (!result?.success) return toast('error', `OpenPlanner issue: ${result?.error}`);
      return toast('success', t('event-management.settings.integrations.feedbacks.openplanner-working'));
    }
    case 'disable-integration': {
      const resultId = parseWithZod(form, { schema: z.object({ id: z.string() }) });
      if (resultId.status !== 'success') return toast('error', t('error.global'));

      const eventIntegrations = EventIntegrations.for(userId, params.team, params.event);
      await eventIntegrations.delete(resultId.value.id);
      return toast('success', t('event-management.settings.integrations.feedbacks.disabled'));
    }
  }

  return null;
};

export default function EventIntegrationsSettingsRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { team } = useParams();
  const { slackWebhookUrl, type } = useCurrentEvent();

  const slackFormId = useId();
  const openPlannerFormId = useId();
  const openAiFormId = useId();

  const aiIntegrationTeam = useFlag('aiIntegration');
  const aiIntegrationEnabled = aiIntegrationTeam === team && type === 'CONFERENCE';

  const openPlanner = loaderData.find((integration) => integration.name === 'OPEN_PLANNER');
  const openAi = loaderData.find((integration) => integration.name === 'OPEN_AI');

  return (
    <div className="space-y-8">
      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.integrations.slack.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id={slackFormId}>
            <Input
              name="slackWebhookUrl"
              label={t('event-management.settings.integrations.slack.url.label')}
              placeholder={t('event-management.settings.integrations.slack.url.placeholder')}
              defaultValue={slackWebhookUrl || ''}
              error={errors?.slackWebhookUrl}
            />
          </Form>
          <Callout title={t('event-management.settings.integrations.slack.info.heading')}>
            <Trans
              i18nKey="event-management.settings.integrations.slack.info.description"
              components={[<ExternalLink key="1" href="https://api.slack.com/incoming-webhooks" weight="medium" />]}
            />
          </Callout>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="save-slack-integration" form={slackFormId}>
            {t('event-management.settings.integrations.slack.submit')}
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.integrations.openplanner.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <Text>
            <Trans
              i18nKey="event-management.settings.integrations.openplanner.description"
              components={[<ExternalLink key="1" href="https://openplanner.fr" weight="medium" />]}
            />
          </Text>

          <Form method="POST" id={openPlannerFormId} key={openPlanner?.id} className="space-y-4">
            <Input
              name="eventId"
              label={t('event-management.settings.integrations.openplanner.event-id')}
              defaultValue={openPlanner?.configuration?.eventId ?? ''}
              error={errors?.eventId}
            />
            <Input
              name="apiKey"
              label={t('event-management.settings.integrations.openplanner.api-key')}
              defaultValue={openPlanner?.configuration?.apiKey ?? ''}
              error={errors?.apiKey}
            />
            <input type="hidden" name="id" value={openPlanner?.id} />
            <input type="hidden" name="name" value="OPEN_PLANNER" />
          </Form>

          <Callout title={t('event-management.settings.integrations.openplanner.info.heading')}>
            <Trans
              i18nKey="event-management.settings.integrations.openplanner.info.description"
              components={[<strong key="1" />]}
            />
          </Callout>
        </Card.Content>

        <Card.Actions>
          {openPlanner ? (
            <>
              <Button
                type="submit"
                name="intent"
                value="disable-integration"
                variant="important"
                form={openPlannerFormId}
                iconLeft={XCircleIcon}
              >
                {t('common.disable')}
              </Button>
              <Button
                type="submit"
                name="intent"
                value="check-open-planner-integration"
                variant="secondary"
                form={openPlannerFormId}
                iconLeft={CheckCircleIcon}
              >
                {t('common.test-connection')}
              </Button>
            </>
          ) : null}
          <Button type="submit" name="intent" value="save-integration" form={openPlannerFormId}>
            {t('event-management.settings.integrations.openplanner.submit')}
          </Button>
        </Card.Actions>
      </Card>

      {/* todo(tests): e2e */}
      {aiIntegrationEnabled ? (
        <Card as="section">
          <Card.Title>
            <H2>{t('event-management.settings.integrations.openai.heading')}</H2>
            <Subtitle>{t('event-management.settings.integrations.openai.description')}</Subtitle>
          </Card.Title>

          <Card.Content>
            <Form method="POST" id={openAiFormId} key={openAi?.id} className="space-y-4">
              <Input
                name="apiKey"
                label={t('event-management.settings.integrations.openai.api-key.label')}
                placeholder={t('event-management.settings.integrations.openai.api-key.placeholder')}
                defaultValue={openAi?.configuration?.apiKey ?? ''}
                error={errors?.apiKey}
              />
              <input type="hidden" name="id" value={openAi?.id} />
              <input type="hidden" name="name" value="OPEN_AI" />
            </Form>
          </Card.Content>

          <Card.Actions>
            {openAi ? (
              <Button
                type="submit"
                name="intent"
                value="disable-integration"
                variant="important"
                form={openAiFormId}
                iconLeft={XCircleIcon}
              >
                {t('common.disable')}
              </Button>
            ) : null}
            <Button type="submit" name="intent" value="save-integration" form={openAiFormId}>
              {t('event-management.settings.integrations.openai.submit')}
            </Button>
          </Card.Actions>
        </Card>
      ) : null}
    </div>
  );
}
