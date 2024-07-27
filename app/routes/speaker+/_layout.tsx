import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_GRADIENT_COLOR } from '~/design-system/colors.ts';
import { Container } from '~/design-system/layouts/container.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

import { Footer } from '../__components/footer.tsx';
import { SpeakerTabs } from './__components/speaker-tabs.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const profile = await SpeakerProfile.for(userId).get();
  return json(profile);
};

export default function SpeakerRoute() {
  const { user } = useUser();
  const profile = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar user={user} />

      <header className={cx(BG_GRADIENT_COLOR, 'hidden sm:block')}>
        <Container className="h-24 flex flex-row items-center relative">
          <Avatar
            picture={profile.picture}
            name={profile.name}
            size="4xl"
            ring
            ringColor="white"
            className="absolute -bottom-12"
          />
          <div className="ml-2 sm:ml-40 p-2 overflow-hidden">
            <H1 size="2xl" variant="light" truncate>
              {profile.name}
            </H1>
            {profile.company && (
              <Text variant="secondary-light" weight="medium">
                {profile.company}
              </Text>
            )}
          </div>
        </Container>
      </header>

      <SpeakerTabs className="sm:ml-40" />

      <Outlet context={{ user }} />

      <Footer />
    </>
  );
}
