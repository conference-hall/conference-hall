import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H1, Text } from '~/design-system/Typography';
import { useLoaderData } from '@remix-run/react';
import { CardLink } from '~/design-system/Card';
import Badge from '~/design-system/Badges';
import { IconLabel } from '~/design-system/IconLabel';
import { MegaphoneIcon, UsersIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/Buttons';
import { hasAccess } from './server/has-access.server';
import { listOrganizations } from './server/list-organizations.server';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const canAccess = await hasAccess(uid);
  if (!canAccess) return redirect('/organizer/request');

  const organizations = await listOrganizations(uid);
  if (organizations.length === 0) return redirect('/organizer/new');

  return json(organizations);
};

export default function OrganizerIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="bg-gray-800">
        <Container className="pb-10 pt-8 sm:flex sm:items-center sm:justify-between">
          <H1 variant="light" mb={0}>
            Your organizations
          </H1>
          <ButtonLink to="/organizer/new">New organization</ButtonLink>
        </Container>
      </div>
      <Container className="my-4 sm:my-8">
        <ul aria-label="Organizations list" className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {data.map((orga) => (
            <CardLink as="li" key={orga.slug} to={orga.slug} rounded="lg" p={4}>
              <div className="mb-8 flex items-center justify-between gap-1">
                <Text size="xl" heading strong truncate>
                  {orga.name}
                </Text>
                <Badge>{orga.role.toLowerCase()}</Badge>
              </div>
              <div className="flex gap-4">
                <IconLabel icon={MegaphoneIcon} truncate>
                  {`${orga.eventsCount} events`}
                </IconLabel>
                <IconLabel icon={UsersIcon} truncate>
                  {`${orga.membersCount} members`}
                </IconLabel>
              </div>
            </CardLink>
          ))}
        </ul>
      </Container>
    </>
  );
}
