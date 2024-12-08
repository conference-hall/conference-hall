import { cx } from 'class-variance-authority';
import { Outlet } from 'react-router';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_GRADIENT_COLOR } from '~/design-system/colors.ts';
import { Container } from '~/design-system/layouts/container.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { Navbar } from '~/routes/components/navbar/navbar.tsx';
import { SpeakerProfileProvider } from '../components/contexts/speaker-profile-context.tsx';
import { Footer } from '../components/footer.tsx';
import type { Route } from './+types/_layout.ts';
import { SpeakerTabs } from './components/speaker-tabs.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  return SpeakerProfile.for(userId).get();
};

export default function SpeakerRoute({ loaderData: profile }: Route.ComponentProps) {
  return (
    <>
      <Navbar />

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

      <SpeakerProfileProvider profile={profile}>
        <Outlet />
      </SpeakerProfileProvider>

      <Footer />
    </>
  );
}
