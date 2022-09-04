import type { LoaderFunction } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1 } from '~/design-system/Typography';

export const loader: LoaderFunction = async ({ request }) => {
  await sessionRequired(request);
  return null;
};

export default function RequestAccessRoute() {
  return (
    <Container className="my-4 sm:my-8">
      <H1>Request access</H1>
    </Container>
  );
}
