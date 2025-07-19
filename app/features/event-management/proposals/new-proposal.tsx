import { parseWithZod } from '@conform-to/zod/v4';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { TalkForm } from '~/features/speaker/talk-library/components/talk-forms/talk-form.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/new-proposal.ts';
import { TalkProposalCreationSchema } from './services/proposal-creation.schema.server.ts';
import { ProposalCreation } from './services/proposal-creation.server.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkProposalCreationSchema });
  if (result.status !== 'success') return { errors: result.error };

  try {
    const proposal = await ProposalCreation.for(userId, params.team, params.event).create(result.value);
    const headers = await toastHeaders('success', t('event-management.proposals.new.feedbacks.created'));
    return redirect(href('/team/:team/:event/reviews/:proposal', { ...params, proposal: proposal.id }), { headers });
  } catch (_error) {
    return { errors: { form: t('error.global') } };
  }
};

export default function NewProposalRoute({ actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team } = useCurrentEventTeam();

  if (!isFeatureEnabled || !team.userPermissions?.canCreateEventProposal) {
    return null;
  }

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
            <TalkForm id="new-proposal-form" errors={actionData?.errors} />
          </Card.Content>

          <Card.Actions>
            <ButtonLink variant="secondary" to={href('/team/:team/:event/reviews', params)}>
              {t('common.cancel')}
            </ButtonLink>
            <Button type="submit" form="new-proposal-form">
              {t('common.submit')}
            </Button>
          </Card.Actions>
        </Card>

        <div className="space-y-4">
          <Card as="section">
            <div className="space-y-2 p-4 lg:p-6">
              <H2 size="s">Speakers</H2>
              <Text size="s">Aucun speaker</Text>
            </div>

            <Divider />

            <div className="space-y-2 p-4 lg:p-6">
              <H2 size="s">Formats</H2>
              <Text size="s">Aucun format</Text>
            </div>

            <Divider />

            <div className="space-y-2 p-4 lg:p-6">
              <H2 size="s">Catégories</H2>
              <Text size="s">Aucune catégorie</Text>
            </div>
            <Divider />

            <div className="space-y-2 p-4 lg:p-6">
              <H2 size="s">Tags</H2>
              <Text size="s">Aucun tag</Text>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
