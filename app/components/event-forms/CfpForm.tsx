import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1, Text } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { Input } from '~/design-system/forms/Input';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function CfpForm() {
  return (
    <Container className="max-w-3xl">
      <div className="mt-24 mb-12 space-y-12 text-center">
        <H1>Activate call for paper</H1>
        <Text variant="secondary">Define the formats and categories of proposals available for the event.</Text>
      </div>
      <div className="space-y-8 bg-white p-8 shadow sm:overflow-hidden sm:rounded-md">
        <Form action="post" className="space-y-8">
          <Input name="cfpStartDate" label="Open date" autoComplete="off" />
          <Input name="cfpEndDate" label="Close date" autoComplete="off" />
        </Form>
        <div className="flex justify-end gap-2">
          <ButtonLink to={`/organizer/proposals`} variant="secondary">
            Do it later
          </ButtonLink>
          <ButtonLink to={`/organizer/proposals`}>Finish</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
