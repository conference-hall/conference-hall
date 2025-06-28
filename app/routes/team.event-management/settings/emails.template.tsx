import { parseWithZod } from '@conform-to/zod';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { EventEmailCustomizations } from '~/.server/event-settings/event-email-customizations.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { CustomTemplateSchema, EventEmailCustomizationSchema } from '~/emails/email.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { isSupportedLanguage } from '~/libs/i18n/i18n.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { EmailCustomBadge } from '../components/settings-page/email-custom-badge.tsx';
import type { Route } from './+types/emails.template.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const emailCustomizationEnabled = await flags.get('emailCustomization');
  if (!emailCustomizationEnabled) {
    throw new Response('Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') || 'en';

  if (!isSupportedLanguage(locale)) throw new Response('Not Found', { status: 404 });

  const template = params.template;
  const result = CustomTemplateSchema.safeParse(template);
  if (!result.success) throw new Response('Not Found', { status: 404 });

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);
  const customization = await emailCustomizations.get(result.data, locale);

  return { template: result.data, locale, customization };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);

  const emailCustomizationEnabled = await flags.get('emailCustomization');
  if (!emailCustomizationEnabled) {
    throw new Response('Not Found', { status: 404 });
  }

  const form = await request.formData();
  const intent = form.get('intent');
  const locale = (form.get('locale') as string) || 'en';

  const template = params.template;
  const result = CustomTemplateSchema.safeParse(template);
  if (!result.success) throw new Response('Not Found', { status: 404 });

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);

  switch (intent) {
    case 'save': {
      const data = parseWithZod(form, { schema: EventEmailCustomizationSchema });
      if (data.status !== 'success') return toast('error', t('error.global'));

      await emailCustomizations.upsert(result.data, locale, data.value);
      return toast('success', t('event-management.settings.emails.feedback.saved'));
    }
    case 'reset': {
      await emailCustomizations.delete(result.data, locale);
      return toast('success', t('event-management.settings.emails.feedback.reset'));
    }
  }
  return null;
};

export default function EmailCustomizationRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { template, locale, customization } = loaderData;

  const customized = Boolean(customization?.id);

  return (
    <Card as="section">
      <Card.Title className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ButtonLink
            variant="secondary"
            size="square-m"
            to={`/team/${currentTeam.slug}/${currentEvent.slug}/settings/emails`}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </ButtonLink>
          <div>
            <div className="flex items-center gap-2">
              <H2>{t(`event-management.settings.emails.types.${template}`)}</H2>
              <span>{t(`common.languages.${locale}.flag`)}</span>
            </div>
            <Subtitle>{t(`event-management.settings.emails.descriptions.${template}`)}</Subtitle>
          </div>
        </div>
        <EmailCustomBadge customized={customized} />
      </Card.Title>

      <Card.Content>
        <Form id={formId} method="POST" className="space-y-6" key={customization?.id}>
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="locale" value={locale} />

          <Input
            name="subject"
            label={t('event-management.settings.emails.form.subject.label')}
            defaultValue={customization?.subject || ''}
          />

          <TextArea
            name="content"
            label={t('event-management.settings.emails.form.content.label')}
            defaultValue={customization?.content || ''}
            rows={12}
          />
        </Form>
      </Card.Content>

      <Card.Actions>
        {customized && (
          <Button type="submit" name="intent" value="reset" form={formId} variant="important">
            {t('event-management.settings.emails.form.reset')}
          </Button>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" name="intent" value="save" form={formId}>
            {t('event-management.settings.emails.form.save')}
          </Button>
        </div>
      </Card.Actions>
    </Card>
  );
}
