import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { TalkSubmission } from '~/features/event-participation/cfp-submission/services/talk-submission.server.ts';
import { EventPage } from '~/features/event-participation/event-page/services/event-page.server.ts';
import { useCurrentEvent } from '~/features/event-participation/event-page-context.tsx';
import { CategoriesForm } from '~/features/speaker/talk-library/components/talk-forms/categories-form.tsx';
import { FormatsForm } from '~/features/speaker/talk-library/components/talk-forms/formats-form.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/4-tracks.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const proposal = await TalkSubmission.for(userId, params.event).get(params.talk);
  return { formats: proposal.formats.map(({ id }) => id), categories: proposal.categories.map(({ id }) => id) };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const schema = await EventPage.of(params.event).buildTracksSchema();
  const result = parseWithZod(form, { schema });
  if (result.status !== 'success') return result.error;

  const submission = TalkSubmission.for(userId, params.event);
  await submission.saveTracks(params.talk, result.value);
  return redirect(String(form.get('redirectTo')));
};

export default function SubmissionTracksRoute({ loaderData: proposal, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();
  const formId = useId();
  const { previousPath, nextPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>{t('event.submission.tracks.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <Form id={formId} method="POST" className="space-y-12">
            {currentEvent.formats?.length > 0 && (
              <section className="space-y-4">
                <FormatsForm
                  formatsAllowMultiple={currentEvent.formatsAllowMultiple}
                  formats={currentEvent.formats}
                  required={currentEvent.formatsRequired}
                  initialValues={proposal.formats}
                />
                {errors?.formats && <Callout title={t('talk.errors.formats.required')} variant="error" />}
              </section>
            )}

            {currentEvent.categories?.length > 0 && (
              <section className="space-y-4">
                <CategoriesForm
                  categoriesAllowMultiple={currentEvent.categoriesAllowMultiple}
                  categories={currentEvent.categories}
                  required={currentEvent.categoriesRequired}
                  initialValues={proposal.categories}
                />
                {errors?.categories && <Callout title={t('talk.errors.categories.required')} variant="error" />}
              </section>
            )}
          </Form>
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            {t('common.go-back')}
          </ButtonLink>
          <Button type="submit" form={formId} name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
