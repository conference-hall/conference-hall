import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { GlobeAltIcon, HomeIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { requireUserSession } from '../../features/auth/auth.server';
import { Container } from '../../components/layout/Container';
import { H3, Text } from '../../components/Typography';
import { Markdown } from '../../components/Markdown';
import { IconLabel } from '../../components/IconLabel';
import { getSpeakerActivity, SpeakerActivity } from '../../features/speaker-activity.server';
import { Link } from '../../components/Links';
import { Activity } from './components/Activity';
import { ButtonLink } from '../../components/Buttons';

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await requireUserSession(request);
  try {
    const profile = await getSpeakerActivity(uid);
    return json<SpeakerActivity>(profile);
  } catch {
    throw new Response('Speaker not found.', { status: 404 });
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
        <div className="mt-5 flex justify-center sm:mt-0 space-x-4">
          <ButtonLink to="/search">Submit a talk</ButtonLink>
        </div>
      </Container>
      <Container className="mt-8">
        <h1 className="sr-only">Your activity</h1>
        <div className="mt-8 grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
          <div className="rounded-lg overflow-hidden border border-gray-200 p-6 bg-white">
            <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
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
                {profile.address && <IconLabel icon={LocationMarkerIcon}>{profile.address}</IconLabel>}
                {profile.twitter && <IconLabel icon={GlobeAltIcon}>{profile.twitter}</IconLabel>}
                {profile.github && <IconLabel icon={GlobeAltIcon}>{profile.github}</IconLabel>}
              </div>
            ) : (
              <Text className="mt-4">Nothing defined.</Text>
            )}
          </div>
          <div className="lg:col-span-2">
            {activities.length > 0 ? (
              <Activity activities={activities} />
            ) : (
              <Text className="mt-4">No submitted proposals yet!.</Text>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
