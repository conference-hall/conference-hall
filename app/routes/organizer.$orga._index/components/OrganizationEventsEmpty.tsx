import { StarIcon } from '@heroicons/react/20/solid';
import { Outlet } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { EmptyState } from '~/design-system/EmptyState';
import { H2, Text } from '~/design-system/Typography';
import type { OrganizationContext } from '~/routes/organizer.$orga/route';

export const OrganizationEventsEmpty = ({ organization }: OrganizationContext) => (
  <Container className="my-4 sm:my-16">
    <EmptyState icon={StarIcon} className="flex flex-col items-center gap-2">
      <h2 className="sr-only">Organization events</h2>
      <H2>{`Welcome to "${organization.name}"`}</H2>

      {organization.role === 'OWNER' ? (
        <>
          <Text type="secondary">Get started by creating your first event.</Text>
          <ButtonLink to="new">New event</ButtonLink>
        </>
      ) : (
        <Text type="secondary">No event created yet.</Text>
      )}
    </EmptyState>
    <Outlet />
  </Container>
);
