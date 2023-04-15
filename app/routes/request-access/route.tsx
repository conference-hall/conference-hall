import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H1, Subtitle } from '~/design-system/Typography';
import { Form, useActionData } from '@remix-run/react';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { ExternalLink } from '~/design-system/Links';
import { validAccessKey } from './server/valid-access-key.server';
import { Container } from '~/design-system/layouts/Container';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  const result = await validAccessKey(uid, String(form.get('key')));

  if (result?.errors) return json(result?.errors);
  return redirect('/organizer');
};

export default function RequestAccessRoute() {
  const errors = useActionData<typeof action>();

  return (
    <Container className="my-4 flex justify-center sm:my-8">
      <Card className="my-16 max-w-2xl p-8">
        <H1 mb={4}>Limited access</H1>
        <Subtitle>The organizer hall is in closed-beta access, you need a key to access it.</Subtitle>
        <Subtitle>
          You can request a beta key by filling{' '}
          <ExternalLink href="https://forms.gle/AnArRCSHibmG59zw7">this form.</ExternalLink>
        </Subtitle>
        <Form method="POST" className="mt-4 space-y-4">
          <Input
            name="key"
            aria-label="Beta access key"
            placeholder="Paste your beta access key here..."
            required
            error={errors?.key}
          />
          <Button type="submit" className="float-right">
            Get access
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
