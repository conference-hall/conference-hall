import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { Footer } from '~/shared-components/Footer';
import { useUser } from '~/root';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { BellSlashIcon } from '@heroicons/react/24/outline';
import { Container } from '~/design-system/layouts/Container';
import { CardLink } from '~/design-system/layouts/Card';
import { H2 } from '~/design-system/Typography';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return json(null);
};

export default function OrganizerRoute() {
  const { user } = useUser();
  const hasNotifications = Boolean(user?.notifications && user?.notifications.length > 0);

  return (
    <>
      <Navbar user={user} withSearch />

      <PageHeaderTitle title="Notifications" subtitle="Notifications from events organizers about your proposals." />

      <Container className="mt-8">
        {hasNotifications ? (
          <ul aria-label="Notifications list" className="space-y-4">
            {user?.notifications.map(({ event, proposal }) => (
              <CardLink
                key={`${event.slug}-${proposal.id}`}
                as="li"
                to={`/${event.slug}/proposals/${proposal.id}`}
                className="flex"
                p={4}
              >
                <div className="mt-1 flex h-6 w-6 shrink-0">🎉</div>
                <div className="ml-4">
                  <H2 size="base">
                    <strong>{proposal.title}</strong> has been accepted to <strong>{event.name}</strong>.
                  </H2>
                  <p className="text-sm text-gray-500">Please confirm or decline your participation.</p>
                </div>
              </CardLink>
            ))}
          </ul>
        ) : (
          <EmptyState label="No notifications" icon={BellSlashIcon} />
        )}
      </Container>

      <Footer />
    </>
  );
}
