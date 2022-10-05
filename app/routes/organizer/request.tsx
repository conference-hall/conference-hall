import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1, Text } from '~/design-system/Typography';
import { Form, useActionData } from '@remix-run/react';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { ExternalLink } from '~/design-system/Links';
import { Card } from '~/design-system/Card';
import { validateOrganizerAccess } from '~/services/organizers/access.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const result = await validateOrganizerAccess(uid, String(form.get('key')));
  if (result?.fieldErrors) return json(result);
  return redirect('/organizer');
};

export default function RequestAccessRoute() {
  const result = useActionData<typeof action>();
  return (
    <Container className="my-4 flex justify-center sm:my-8">
      <Card className="my-16 max-w-2xl p-8">
        <H1>Limited access</H1>
        <Text variant="secondary" className="mt-6">
          The organizer hall is in closed-beta access, you need a key to access it.
        </Text>
        <Text variant="secondary">
          You can request a beta key by filling{' '}
          <ExternalLink href="https://forms.gle/AnArRCSHibmG59zw7">this form.</ExternalLink>
        </Text>
        <Form method="post" className="mt-4 space-y-4">
          <Input
            name="key"
            aria-label="Beta access key"
            placeholder="Paste your beta access key here..."
            required
            error={result?.fieldErrors?.key?.[0]}
          />
          <Button type="submit" className="float-right">
            Get access
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
