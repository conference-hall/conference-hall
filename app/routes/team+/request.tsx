import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { KeyIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { TeamBetaAccess } from '~/.server/team/team-beta-access.ts';
import { Button, button } from '~/design-system/buttons.tsx';
import { DividerWithLabel } from '~/design-system/divider.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { FullscreenPage } from '../__components/fullscreen-page.tsx';

export const meta = mergeMeta(() => [{ title: 'Request access | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();

  try {
    await TeamBetaAccess.for(userId).validateAccessKey(String(form.get('key')));
    return redirect('/team/new');
  } catch (InvalidAccessKeyError) {
    return json({ key: ['Invalid access key'] });
  }
};

export default function RequestAccessRoute() {
  const errors = useActionData<typeof action>();

  return (
    <FullscreenPage>
      <FullscreenPage.Title
        title="Become event organizer."
        subtitle="Conference Hall for event organizers is in closed-beta access, you need a key to access it."
      />

      <Card className="p-8 md:p-12">
        <Form method="POST" className="flex flex-col sm:flex-row gap-2">
          <Input
            name="key"
            aria-label="Beta access key"
            placeholder="Paste your beta access key here..."
            className="grow"
            required
            error={errors?.key}
          />
          <Button type="submit" variant="secondary" iconRight={ArrowRightIcon}>
            Get access
          </Button>
        </Form>

        <DividerWithLabel label="or" className="py-8" />

        <a href="https://forms.gle/AnArRCSHibmG59zw7" target="_blank" className={button()} rel="noreferrer">
          <KeyIcon className="h-4 w-4" aria-hidden="true" />
          Request a beta access key
        </a>
      </Card>
    </FullscreenPage>
  );
}
