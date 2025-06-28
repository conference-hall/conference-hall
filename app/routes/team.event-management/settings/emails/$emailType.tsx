import { parseWithZod } from '@conform-to/zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Link } from 'react-router';
import { EventEmailCustomizations } from '~/.server/event-settings/event-email-customizations.ts';
import {
  type EmailType,
  EventEmailCustomizationSchema,
} from '~/.server/event-settings/event-email-customizations.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { EMAIL_TYPE_LABELS } from '~/libs/constants.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { isSupportedLanguage } from '~/libs/i18n/i18n.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useFlag } from '~/routes/components/contexts/flags-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import type { Route } from './+types/$emailType.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const emailCustomizationEnabled = await flags.get('emailCustomization');
  if (!emailCustomizationEnabled) {
    throw new Response('Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') || 'en';

  if (!isSupportedLanguage(locale)) {
    throw new Response('Not Found', { status: 404 });
  }

  // Validate email type
  const emailTypeKey = params.emailType;
  const emailType = Object.entries(EMAIL_TYPE_LABELS).find(
    ([_, label]) => label.key === emailTypeKey,
  )?.[0] as EmailType;

  if (!emailType) {
    throw new Response('Not Found', { status: 404 });
  }

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);
  const customization = await emailCustomizations.get(emailType, locale);

  return { emailType, locale, customization };
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

  const emailTypeKey = params.emailType;
  const emailType = Object.entries(EMAIL_TYPE_LABELS).find(
    ([_, label]) => label.key === emailTypeKey,
  )?.[0] as EmailType;

  if (!emailType) {
    throw new Response('Not Found', { status: 404 });
  }

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);

  switch (intent) {
    case 'save': {
      const result = parseWithZod(form, { schema: EventEmailCustomizationSchema });
      if (result.status !== 'success') return result.error;

      await emailCustomizations.upsert(emailType, locale, result.value);
      return toast('success', t('event-management.settings.emails.feedback.saved'));
    }
    case 'reset': {
      await emailCustomizations.delete(emailType, locale);
      return toast('success', t('event-management.settings.emails.feedback.reset'));
    }
  }
  return null;
};

export default function EmailCustomizationRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const emailCustomizationEnabled = useFlag('emailCustomization');
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { emailType, locale, customization } = loaderData;
  const formId = useId();

  if (!emailCustomizationEnabled) {
    return null;
  }

  const isCustomized = Boolean(customization?.id);
  const emailTypeLabel = EMAIL_TYPE_LABELS[emailType as keyof typeof EMAIL_TYPE_LABELS];

  return (
    <Card as="section">
      <Card.Title>
        <div className="flex items-center gap-4">
          <Link
            to={`/team/${currentTeam.slug}/${currentEvent.slug}/settings/emails`}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <H2>{t(emailTypeLabel.i18nKey)}</H2>
              <span>{t(`common.languages.${locale}.flag`)}</span>
            </div>
            <Text className="text-sm text-slate-600 space-x-2">
              {emailType === 'PROPOSAL_SUBMITTED' &&
                t('event-management.settings.emails.descriptions.proposal-submitted')}
              {emailType === 'PROPOSAL_ACCEPTED' &&
                t('event-management.settings.emails.descriptions.proposal-accepted')}
              {emailType === 'PROPOSAL_DECLINED' &&
                t('event-management.settings.emails.descriptions.proposal-declined')}
            </Text>
          </div>
        </div>
      </Card.Title>

      <Card.Content>
        <Form id={formId} method="POST" className="space-y-6" key={customization?.id}>
          <input type="hidden" name="emailType" value={emailType} />
          <input type="hidden" name="locale" value={locale} />

          <Input
            name="subject"
            label={t('event-management.settings.emails.form.subject.label')}
            defaultValue={customization?.subject || ''}
            error={actionData?.subject}
          />

          <TextArea
            name="content"
            label={t('event-management.settings.emails.form.content.label')}
            defaultValue={customization?.content || ''}
            rows={12}
            error={actionData?.content}
          />

          <TextArea
            name="signature"
            label={t('event-management.settings.emails.form.signature.label')}
            defaultValue={customization?.signature || ''}
            rows={3}
            error={actionData?.signature}
          />
        </Form>
      </Card.Content>

      <Card.Actions>
        {isCustomized && (
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
