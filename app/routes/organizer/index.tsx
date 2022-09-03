import type { LoaderFunction } from '@remix-run/node';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { EmptyState } from '~/design-system/EmptyState';
import { sessionRequired } from '~/services/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  await sessionRequired(request);
  return null;
};

export default function OrganizerRoute() {
  return (
    <Container className="my-4 sm:my-8">
      <EmptyState icon={BuildingOfficeIcon} label="You don't have any organizations.">
        <ButtonLink to="new">New organization</ButtonLink>
      </EmptyState>
    </Container>
  );
}
