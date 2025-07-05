import { Cog6ToothIcon, FireIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { Footer } from '~/app-platform/components/footer.tsx';
import { Navbar } from '~/app-platform/components/navbar/navbar.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_GRADIENT_COLOR } from '~/design-system/colors.ts';
import { Container } from '~/design-system/layouts/container.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { SpeakerProfileProvider } from '~/features/speaker/speaker-profile-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/layout.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return SpeakerProfile.for(userId).get();
};

export default function SpeakerRoute({ loaderData: profile }: Route.ComponentProps) {
  const { t } = useTranslation();

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

      <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
        <NavTabs py={4} scrollable className="grow sm:ml-40">
          <NavTab to={href('/speaker')} icon={FireIcon} end>
            {t('speaker.nav.activity')}
          </NavTab>

          <NavTab to={href('/speaker/talks')} icon={MicrophoneIcon}>
            {t('speaker.nav.talks')}
          </NavTab>

          <NavTab to={href('/speaker/settings')} icon={Cog6ToothIcon}>
            {t('speaker.nav.settings')}
          </NavTab>
        </NavTabs>
      </Page.NavHeader>

      <SpeakerProfileProvider profile={profile}>
        <Outlet />
      </SpeakerProfileProvider>

      <Footer />
    </>
  );
}
