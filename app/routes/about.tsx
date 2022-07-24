import { ButtonLink } from '../components-ui/Buttons';
import { Container } from '../components-ui/Container';
import { H1, H2 } from '../components-ui/Typography';

export default function AboutRoute() {
  return (
    <div>
      <section className="bg-white">
        <Container className="py-16">
          <H1>Welcome to Conference Hall.</H1>
          <H2 className="mt-2 text-gray-500">
            All-in-one call for paper platform.
          </H2>
          <div className="mt-12">
            <ButtonLink to="/" size="large">
              See all conferences and meetups
            </ButtonLink>
          </div>
        </Container>
      </section>
      <section>
        <Container className="py-16">
          <H2>Speakers</H2>
          <ul className="mt-4">
            <li>Find conferences and meetups to speak.</li>
            <li>Manage your talks</li>
            <li>Invite your co-speakers</li>
            <li>Write it once, submit everywhere.</li>
          </ul>
        </Container>
      </section>
      <section className="bg-white">
        <Container className="py-16">
          <H2>Event organizers</H2>
          <ul className="mt-4">
            <li>Create your conference and meetups</li>
            <li>Manage your team.</li>
            <li>Rate the proposals you received.</li>
            <li>Send email for accepted and rejected proposals.</li>
          </ul>
        </Container>
      </section>
      <section>
        <Container className="py-16">
          <H2>Thanks to all contributors</H2>
          <ul className="mt-4">
            <li>Fully open source</li>
          </ul>
        </Container>
      </section>
    </div>
  );
}
