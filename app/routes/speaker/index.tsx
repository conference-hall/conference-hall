import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { GlobeAltIcon, HomeIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { Container } from '../../design-system/Container';
import { H3, Text } from '../../design-system/Typography';
import { Markdown } from '../../design-system/Markdown';
import { IconLabel } from '../../design-system/IconLabel';
import { Link } from '../../design-system/Links';
import { SpeakerActivities } from '../../components/SpeakerActivities';
import { ButtonLink } from '../../design-system/Buttons';
import type { SpeakerActivity } from '../../services/speakers/activity.server';
import { getSpeakerActivity } from '../../services/speakers/activity.server';
import { mapErrorToResponse } from '../../services/errors';
import { sessionRequired } from '../../services/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await sessionRequired(request);
  try {
    const profile = await getSpeakerActivity(uid);
    return json<SpeakerActivity>(profile);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function ProfileRoute() {
  const { profile, activities } = useLoaderData<SpeakerActivity>();
  return (
    <>
      <Container className="pt-8 pb-4 sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0">
              <img
                className="mx-auto h-20 w-20 rounded-full ring-4 ring-indigo-500"
                src={profile.photoURL || 'https://placekitten.com/100/100'}
                alt=""
              />
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-sm font-medium text-gray-600">Welcome back,</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{profile.name}</p>
              <p className="text-sm font-medium text-gray-600">{profile.email}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-center space-x-4 sm:mt-0">
          <ButtonLink to="/">Submit a talk</ButtonLink>
        </div>
      </Container>
      <Container className="mt-8">
        <h1 className="sr-only">Your activity</h1>
        <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <H3>{profile.name}'s profile</H3>
              <div className="flex-shrink-0 space-x-4">
                <Link to="settings">Edit profile</Link>
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
