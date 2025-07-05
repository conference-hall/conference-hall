import { parseWithZod } from '@conform-to/zod';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { EventEmailCustomizations } from '~/.server/event-settings/event-email-customizations.tsx';
import {
  CustomTemplateSchema,
  EventEmailCustomDeleteSchema,
  EventEmailCustomUpsertSchema,
} from '~/emails/email.types.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { isSupportedLanguage } from '~/libs/i18n/i18n.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { EditTemplateButton, ResetTemplateButton } from '../components/settings-page/email-custom-actions.tsx';
import { EmailCustomBadge } from '../components/settings-page/email-custom-badge.tsx';
import { EmailPreview } from '../components/settings-page/email-preview.tsx';
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
  const customizationPreview = await emailCustomizations.getForPreview(result.data, locale);

  return { ...customizationPreview, locale };
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

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);

  switch (intent) {
    case 'save': {
      const data = parseWithZod(form, { schema: EventEmailCustomUpsertSchema });
      if (data.status !== 'success') return toast('error', t('error.global'));

      await emailCustomizations.save(data.value);
      return toast('success', t('event-management.settings.emails.feedback.saved'));
    }
    case 'reset': {
      const data = parseWithZod(form, { schema: EventEmailCustomDeleteSchema });
      if (data.status !== 'success') return toast('error', t('error.global'));

      await emailCustomizations.reset(data.value);
      return toast('success', t('event-management.settings.emails.feedback.reset'));
    }
  }
  return null;
};

export default function EmailCustomizationRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { template, locale, customization, defaults, preview } = loaderData;

  const customized = Boolean(customization?.id);

  return (
    <Card as="section">
      <Card.Title className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonLink
            variant="secondary"
            size="square-m"
            to={`/team/${currentTeam.slug}/${currentEvent.slug}/settings/emails`}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors"
            aria-label={t('common.go-back')}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </ButtonLink>

          <div>
            <div className="flex items-center gap-2">
              <H2>{t(`event-management.settings.emails.types.${template}`)}</H2>
              <span>{t(`common.languages.${locale}.flag`)}</span>
            </div>
            <Subtitle className="hidden sm:block">
              {t(`event-management.settings.emails.descriptions.${template}`)}
            </Subtitle>
          </div>
        </div>

        <EmailCustomBadge customized={customized} />
      </Card.Title>

      <Card.Content>
        <EmailPreview from={defaults.from} subject={customization?.subject || defaults.subject} preview={preview} />
      </Card.Content>

      <Card.Actions>
        <ResetTemplateButton template={template} locale={locale} customization={customization} defaults={defaults} />
        <EditTemplateButton template={template} locale={locale} customization={customization} defaults={defaults} />
      </Card.Actions>
    </Card>
  );
}
