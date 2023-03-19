import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { GlobeAltIcon, HomeIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { Container } from '../../design-system/Container';
import { H3, Text } from '../../design-system/Typography';
import { Markdown } from '../../design-system/Markdown';
import { IconLabel } from '../../design-system/IconLabel';
import { Link } from '../../design-system/Links';
import { SpeakerActivities } from '../../components/SpeakerActivities';
import { mapErrorToResponse } from '../../libs/errors';
import { sessionRequired } from '../../libs/auth/auth.server';
import type { SpeakerContext } from '../speaker';
import { getActivity } from './server/get-activity.server';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const activities = await getActivity(uid);
    return json(activities);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function ProfileRoute() {
  const activities = useLoaderData<typeof loader>();
  const { user } = useOutletContext<SpeakerContext>();

  return (
    <>
      <Container className="mt-8">
        <h1 className="sr-only">Your activity</h1>
        <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <H3>{user.name}'s profile</H3>
              <div className="flex-shrink-0 space-x-4">
                <Link to="profile">Edit profile</Link>
              </div>
            </div>
            {user.bio ? (
              <Markdown className="mt-4 line-clamp-5" source={user.bio} />
            ) : (
              <Text className="mt-4">No biography defined.</Text>
            )}
            {user.references ? (
              <Markdown className="mt-4 line-clamp-5" source={user.references} />
            ) : (
              <Text className="mt-4">No references defined.</Text>
            )}
            <div className="mt-6 grid grid-cols-1 gap-4">
              {user.company && <IconLabel icon={HomeIcon}>{user.company}</IconLabel>}
              {user.address && <IconLabel icon={MapPinIcon}>{user.address}</IconLabel>}
              {user.twitter && <IconLabel icon={GlobeAltIcon}>{user.twitter}</IconLabel>}
              {user.github && <IconLabel icon={GlobeAltIcon}>{user.github}</IconLabel>}
            </div>
          </div>
          <div className="lg:col-span-2">
            {activities.length > 0 ? (
              <SpeakerActivities activities={activities} />
            ) : (
              <Text className="mt-4">No submitted proposals yet!.</Text>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
