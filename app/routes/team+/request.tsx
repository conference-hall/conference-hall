import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { TeamBetaAccess } from '~/.server/team/team-beta-access.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

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
    return json({ key: 'Invalid access key' });
  }
};

export default function RequestAccessRoute() {
  const errors = useActionData<typeof action>();

  return (
    <Page className="flex justify-center">
      <div>
        <H1>Become event organizer</H1>
        <Subtitle>Conference Hall for event organizers is in closed-beta access, you need a key to access it.</Subtitle>
        <Subtitle>
          You can request a beta key by filling{' '}
          <ExternalLink href="https://forms.gle/AnArRCSHibmG59zw7">this form.</ExternalLink>
        </Subtitle>
        <Form method="POST" className="mt-8 w-full space-y-4">
          <Input
            name="key"
            aria-label="Beta access key"
            placeholder="Paste your beta access key here..."
            required
            error={errors?.key}
          />
          <Button type="submit">Get access to Conference Hall</Button>
        </Form>
      </div>
    </Page>
  );
}
