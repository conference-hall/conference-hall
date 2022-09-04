import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H3 } from '~/design-system/Typography';
import { ButtonLink } from '~/design-system/Buttons';

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  const slug = params.slug!;
  return json({ name: slug });
};

export default function OrganizationMembersRoute() {
  return (
    <>
      <Container className="my-4 sm:my-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <H3>Members</H3>
          <ButtonLink to="new" size="small" className="mt-4 sm:mt-0">
            Invite member
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
