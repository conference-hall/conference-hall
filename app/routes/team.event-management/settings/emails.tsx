import { useTranslation } from 'react-i18next';
import { EventEmailCustomizations } from '~/.server/event-settings/event-email-customizations.ts';
import { Badge } from '~/design-system/badges.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { EMAIL_TYPE_LABELS } from '~/libs/constants.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { SUPPORTED_LANGUAGES } from '~/libs/i18n/i18n.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import type { Route } from './+types/emails.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const emailCustomizationEnabled = await flags.get('emailCustomization');
  if (!emailCustomizationEnabled) {
    throw new Response('Not Found', { status: 404 });
  }

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);
  const customizations = await emailCustomizations.list();

  return { customizations };
};

export default function EventEmailsSettingsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { customizations } = loaderData;

  const getStatusBadge = (emailType: string, locale: string) => {
    const customization = customizations.find((c) => c.emailType === emailType && c.locale === locale);
    if (!customization) {
      return <Badge pill>{t('common.default')}</Badge>;
    }

    return (
      <Badge color="green" pill>
        {t('common.customized')}
      </Badge>
    );
  };

  const emailTypes = Object.keys(EMAIL_TYPE_LABELS) as Array<keyof typeof EMAIL_TYPE_LABELS>;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.emails.heading')}</H2>
      </Card.Title>

      <Card.Content>
        <Subtitle>{t('event-management.settings.emails.description')}</Subtitle>

        <div className="space-y-4">
          {emailTypes.map((emailType) => (
            <div key={emailType} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-900">{t(EMAIL_TYPE_LABELS[emailType].i18nKey)}</h3>
                <p className="text-xs text-slate-500">
                  {t(`event-management.settings.emails.descriptions.${EMAIL_TYPE_LABELS[emailType].key}`)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUPPORTED_LANGUAGES.map((locale) => (
                  <div key={locale} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <span>{t(`common.languages.${locale}.flag`)}</span>
                      {getStatusBadge(emailType, locale)}
                    </div>
                    <Link
                      to={`/team/${currentTeam.slug}/${currentEvent.slug}/settings/emails/${EMAIL_TYPE_LABELS[emailType].key}?locale=${locale}`}
                      weight="medium"
                      size="xs"
                    >
                      {t('common.customize')}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
