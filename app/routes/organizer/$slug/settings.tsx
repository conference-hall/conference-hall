import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H3 } from '~/design-system/Typography';

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  const slug = params.slug!;
  return json({ name: slug });
};

export default function OrganizationSettingsRoute() {
  return (
    <>
      <Container className="my-4 sm:my-8">
        <H3>Settings</H3>
      </Container>
    </>
  );
}
