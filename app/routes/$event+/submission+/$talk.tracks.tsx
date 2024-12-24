import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Form, redirect } from 'react-router';
import { TalkSubmission } from '~/.server/cfp-submission-funnel/talk-submission.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import { CategoriesForm } from '~/routes/components/talks/talk-forms/categories-form.tsx';
import { FormatsForm } from '~/routes/components/talks/talk-forms/formats-form.tsx';
import type { Route } from './+types/$talk.tracks.ts';
import { useSubmissionNavigation } from './components/submission-context.tsx';

export const handle = { step: 'tracks' };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const proposal = await TalkSubmission.for(userId, params.event).get(params.talk);
  return { formats: proposal.formats.map(({ id }) => id), categories: proposal.categories.map(({ id }) => id) };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const schema = await EventPage.of(params.event).buildTracksSchema();
  const result = parseWithZod(form, { schema });
  if (result.status !== 'success') return result.error;

  const submission = TalkSubmission.for(userId, params.event);
  await submission.saveTracks(params.talk, result.value);

  return redirect(String(form.get('redirectTo')));
};

export default function SubmissionTracksRoute({ loaderData: proposal, actionData: errors }: Route.ComponentProps) {
  const currentEvent = useCurrentEvent();
  const { previousPath, nextPath } = useSubmissionNavigation();

  return (
    <Page>
      <Card>
        <Card.Title>
          <H2>Proposal tracks</H2>
        </Card.Title>

        <Card.Content>
          <Form id="tracks-form" method="POST">
            <div className="space-y-12">
              {currentEvent.formats?.length > 0 && (
                <section>
                  <FormatsForm
                    formatsAllowMultiple={currentEvent.formatsAllowMultiple}
                    formats={currentEvent.formats}
                    required={currentEvent.formatsRequired}
                    initialValues={proposal.formats}
                  />
                  {errors?.formats && (
                    <Callout title="You must select at least one proposal format." variant="error" className="mt-4" />
                  )}
                </section>
              )}

              {currentEvent.categories?.length > 0 && (
                <section>
                  <CategoriesForm
                    categoriesAllowMultiple={currentEvent.categoriesAllowMultiple}
                    categories={currentEvent.categories}
                    required={currentEvent.categoriesRequired}
                    initialValues={proposal.categories}
                  />
                  {errors?.categories && (
                    <Callout title="You must select at least one proposal category." variant="error" className="mt-4" />
                  )}
                </section>
              )}
            </div>
          </Form>
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={previousPath} variant="secondary">
            Go back
          </ButtonLink>
          <Button type="submit" form="tracks-form" name="redirectTo" value={nextPath} iconRight={ArrowRightIcon}>
            Continue
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
