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
import { mapErrorToResponse } from '../../services/errors';
import { sessionRequired } from '../../services/auth/auth.server';
import { getActivity } from '~/services/speakers/activity.server';
import type { ProfileContext } from '../speaker';

export const loader = async ({ request }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const profile = await getActivity(uid);
    return json(profile);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function ProfileRoute() {
  const activities = useLoaderData<typeof loader>();
  const { profile } = useOutletContext<ProfileContext>();

  return (
    <>
      <Container className="mt-8">
        <h1 className="sr-only">Your activity</h1>
        <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <H3>{profile.name}'s profile</H3>
              <div className="flex-shrink-0 space-x-4">
                <Link to="profile">Edit profile</Link>
              </div>
            </div>
            {profile.bio ? (
              <Markdown className="mt-4 line-clamp-5" source={profile.bio} />
            ) : (
              <Text className="mt-4">No biography defined.</Text>
            )}
            {profile.references ? (
              <Markdown className="mt-4 line-clamp-5" source={profile.references} />
            ) : (
              <Text className="mt-4">No references defined.</Text>
            )}
            {profile.address ? (
              <div className="mt-6 grid grid-cols-1 gap-4">
                {profile.company && <IconLabel icon={HomeIcon}>{profile.company}</IconLabel>}
                {profile.address && <IconLabel icon={MapPinIcon}>{profile.address}</IconLabel>}
                {profile.twitter && <IconLabel icon={GlobeAltIcon}>{profile.twitter}</IconLabel>}
                {profile.github && <IconLabel icon={GlobeAltIcon}>{profile.github}</IconLabel>}
              </div>
            ) : (
              <Text className="mt-4">Nothing defined.</Text>
            )}
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
