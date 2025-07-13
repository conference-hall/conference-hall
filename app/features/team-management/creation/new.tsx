import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { TeamCreateSchema, TeamCreation } from '~/features/team-management/creation/services/team-creation.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/new.ts';
import { TeamForm } from './components/team-form.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = await parseWithZod(form, { schema: TeamCreateSchema, async: true });
  if (result.status !== 'success') return result.error;

  const team = await TeamCreation.for(userId).create(result.value);
  return redirect(`/team/${team.slug}`);
};

export default function NewTeamRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  return (
    <FullscreenPage navbar="default">
      <FullscreenPage.Title title={t('team.new.heading')} subtitle={t('team.new.description')} />

      <Card>
        <Card.Content>
          <Form id={formId} method="POST" className="space-y-8">
            <TeamForm errors={errors} />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button type="submit" className="mt-4" form={formId}>
            {t('team.new.form.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </FullscreenPage>
  );
}
