import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import { Button } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { ExternalLink } from '~/design-system/Links.tsx';
import { H1, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useUser } from '~/root.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';

import { validAccessKey } from './__server/teams/valid-access-key.server.ts';

export const meta = mergeMeta(() => [{ title: 'Request access | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const result = await validAccessKey(userId, String(form.get('key')));

  if (result?.errors) return json(result?.errors);
  return redirect('/team');
};

export default function RequestAccessRoute() {
  const errors = useActionData<typeof action>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} withSearch />

      <Container className="my-4 flex justify-center sm:my-8">
        <div className="flex max-w-2xl flex-col items-center p-8">
          <H1 mb={4}>Become event organizer</H1>
          <Subtitle>
            Conference Hall for event organizers is in closed-beta access, you need a key to access it.
          </Subtitle>
          <Subtitle>
            You can request a beta key by filling{' '}
            <ExternalLink href="https://forms.gle/AnArRCSHibmG59zw7">this form.</ExternalLink>
          </Subtitle>
          <Form method="POST" className="mt-12 w-full space-y-8">
            <Input
              name="key"
              aria-label="Beta access key"
              placeholder="Paste your beta access key here..."
              required
              error={errors?.key}
            />
            <Button type="submit" block>
              Get access to Conference Hall
            </Button>
          </Form>
        </div>
      </Container>
    </>
  );
}