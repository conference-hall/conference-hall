import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H1, Text } from '~/design-system/Typography';
import { hasOrganizerAccess } from '~/services/organizers/access.server';
import { getOrganizations } from '~/services/organizers/organizations.server';
import { useLoaderData } from '@remix-run/react';
import { CardLink } from '~/design-system/Card';
import Badge from '~/design-system/Badges';
import { IconLabel } from '~/design-system/IconLabel';
import { MegaphoneIcon, UsersIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const hasAccess = await hasOrganizerAccess(uid);
  if (!hasAccess) return redirect('/organizer/request');

  const organizations = await getOrganizations(uid);
  if (organizations.length === 0) return redirect('/organizer/new');

  return json(organizations);
};

export default function OrganizerIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container className="my-4 sm:my-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <H1>Select an organization</H1>
        <ButtonLink to="/organizer/new">New organization</ButtonLink>
      </div>
      <ul aria-label="Organizations list" className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {data.map((orga) => (
          <CardLink as="li" key={orga.slug} to={orga.slug}>
            <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-1">
                <Text as="p" size="l" variant="link" className="truncate font-medium">
                  {orga.name}
                </Text>
                <Badge>{orga.role.toLowerCase()}</Badge>
              </div>
              <div className="space-y-2">
                <IconLabel icon={MegaphoneIcon} truncate>
                  {`${orga.eventsCount} events`}
                </IconLabel>
                <IconLabel icon={UsersIcon} truncate>
                  {`${orga.membersCount} members`}
                </IconLabel>
              </div>
            </div>
          </CardLink>
        ))}
      </ul>
    </Container>
  );
}
