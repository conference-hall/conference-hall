import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { GlobeAltIcon, HomeIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { requireUserSession } from '../../features/auth/auth.server';
import { Container } from '../../components/layout/Container';
import { H2, H3, Text } from '../../components/Typography';
import { Markdown } from '../../components/Markdown';
import { IconLabel } from '../../components/IconLabel';
import { getProfile, SpeakerProfile } from '../../features/speaker-profile.server';

export const loader: LoaderFunction =  async ({ request, params }) => {
  const uid = await requireUserSession(request);
  try {
    const profile = await getProfile(uid);
    return json<SpeakerProfile>(profile);
  } catch {
    throw new Response('Speaker not found.', { status: 404 });
  }
};

export default function ProfileRoute() {
  const user = useLoaderData<SpeakerProfile>();
  return (
    <Container className="mt-8">
      <h1 className="sr-only">Your profile</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <H2>Biography</H2>
          {user.bio ? (
            <Markdown className="mt-4" source={user.bio} />
          ) : (
            <Text className="mt-4">No biography defined.</Text>
          )}
          <H2 className="mt-8">References</H2>
          {user.references ? (
            <Markdown className="mt-4" source={user.references} />
          ) : (
            <Text className="mt-4">No references defined.</Text>
          )}
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200 p-6">
          <H3>Additional information</H3>
          {user.address ? (
            <div className="mt-6 grid grid-cols-1 gap-4">
              {user.company && <IconLabel icon={HomeIcon}>{user.company}</IconLabel>}
              {user.address && <IconLabel icon={LocationMarkerIcon}>{user.address}</IconLabel>}
              {user.twitter && <IconLabel icon={GlobeAltIcon}>{user.twitter}</IconLabel>}
              {user.github && <IconLabel icon={GlobeAltIcon}>{user.github}</IconLabel>}
            </div>
          ) : (
            <Text className="mt-4">Nothing defined.</Text>
          )}
        </div>
      </div>
    </Container>
  );
}
