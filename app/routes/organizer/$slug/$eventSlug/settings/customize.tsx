import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useOutletContext } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { AlertInfo } from '~/design-system/Alerts';
import { ExternalLink } from '~/design-system/Links';
import type { OrganizerEventContext } from '../../$eventSlug';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-4">Customize event banner</H2>
        <Form className="mt-6 space-y-4">
          <Text variant="secondary" className="mt-4">
            Upload your event banner to give a fancy style to your event page.
          </Text>
          <AlertInfo>
            JPEG format with optimal resolution of 1500x500.
            <br />
            100kB max (optimize it with <ExternalLink href="https://squoosh.app">squoosh.app</ExternalLink>)
          </AlertInfo>
          {event.bannerUrl && <img src={event.bannerUrl} alt="Event banner" className="h-64 rounded" />}
          <Button>Upload banner</Button>
        </Form>
      </section>
    </>
  );
}
