import type { LoaderArgs } from '@remix-run/node';
import type { OrganizationContext } from '../$slug';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H3 } from '~/design-system/Typography';
import { useOutletContext } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { EmptyState } from '~/design-system/EmptyState';
import { StarIcon } from '@heroicons/react/24/outline';

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  const slug = params.slug!;
  return json({ name: slug });
};

export default function OrganizationEventsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  return (
    <>
      <Container className="my-4 sm:my-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <H3>Events</H3>
          <ButtonLink to="new" size="small" className="mt-4 sm:mt-0">
            New event
          </ButtonLink>
        </div>
        <EmptyState
          icon={StarIcon}
          label={`Welcome to "${organization.name}"`}
          description="Get started by creating your first event."
        >
          <ButtonLink variant="secondary" to="new" size="small" className="mt-4 sm:mt-0">
            New event
          </ButtonLink>
        </EmptyState>
      </Container>
    </>
  );
}
