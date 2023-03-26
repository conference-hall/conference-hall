import { Navbar } from '~/shared-components/navbar/Navbar';
import { ButtonLink } from '../design-system/Buttons';
import { Container } from '../design-system/Container';
import { H1, H2 } from '../design-system/Typography';
import { useOutletContext } from '@remix-run/react';
import type { UserContext } from '~/root';

export default function AboutRoute() {
  const { user, notifications } = useOutletContext<UserContext>();

  return (
    <>
      <Navbar user={user} notifications={notifications} />
      <Container as="section" className="py-8 sm:py-16">
        <H1>Welcome to Conference Hall.</H1>
        <H2 className="mt-2 text-gray-500">All-in-one call for paper platform.</H2>
        <div className="mt-12">
          <ButtonLink to="/" size="l">
            See all conferences and meetups
          </ButtonLink>
        </div>
      </Container>
      <Container as="section" className="py-8 sm:py-16">
        <H2>Speakers</H2>
        <ul className="mt-4">
          <li>Find conferences and meetups to speak.</li>
          <li>Manage your talks</li>
          <li>Invite your co-speakers</li>
          <li>Write it once, submit everywhere.</li>
        </ul>
      </Container>
      <Container as="section" className="py-8 sm:py-16">
        <H2>Event organizers</H2>
        <ul className="mt-4">
          <li>Create your conference and meetups</li>
          <li>Manage your team.</li>
          <li>Rate the proposals you received.</li>
          <li>Send email for accepted and rejected proposals.</li>
        </ul>
      </Container>
      <Container as="section" className="py-8 sm:py-16">
        <H2>Thanks to all contributors</H2>
        <ul className="mt-4">
          <li>Fully open source</li>
        </ul>
      </Container>
    </>
  );
}
