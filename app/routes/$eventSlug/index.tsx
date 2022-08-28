import { GlobeEuropeAfricaIcon, HeartIcon, EnvelopeIcon } from '@heroicons/react/20/solid';
import { useCatch } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../$eventSlug';
import { ButtonLink } from '../../design-system/Buttons';
import { CfpInfo } from '../../components/CfpInfo';
import { ExternalLink } from '../../design-system/Links';
import { Markdown } from '../../design-system/Markdown';
import { H2, Text } from '../../design-system/Typography';

export default function EventRoute() {
  const event = useEvent();
  return (
    <>
      <img
        src={event.bannerUrl || 'https://placekitten.com/1200/300'}
        className="hidden h-64 w-full bg-gray-100 object-cover sm:block"
        height="256px"
        aria-hidden="true"
        alt=""
      />
      <Container
        as="section"
        className="mt-4 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <CfpInfo cfpState={event.cfpState} cfpStart={event.cfpStart} cfpEnd={event.cfpEnd} />
        {event.cfpState === 'OPENED' && (
          <div className="flex-shrink-0">
            <ButtonLink to="submission" block>
              Submit a proposal
            </ButtonLink>
          </div>
        )}
      </Container>

      <Container as="section" className="mt-8">
        <Markdown source={event.description} size="base" />
      </Container>

      {event.websiteUrl || event.contactEmail || event.codeOfConductUrl ? (
        <Container as="section" className="mt-8 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:gap-16">
          {event.websiteUrl && (
            <ExternalLink href={event.websiteUrl} icon={GlobeEuropeAfricaIcon}>
              Website
            </ExternalLink>
          )}
          {event.contactEmail && (
            <ExternalLink href={`mailto:${event.contactEmail}`} icon={EnvelopeIcon}>
              Contacts
            </ExternalLink>
          )}
          {event.codeOfConductUrl && (
            <ExternalLink href={event.codeOfConductUrl} icon={HeartIcon}>
              Code of conduct
            </ExternalLink>
          )}
        </Container>
      ) : null}

      {event.formats.length > 0 || event.categories.length > 0 ? (
        <Container className="mt-8 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-16">
          {event.formats.length > 0 ? (
            <div>
              <H2>Formats</H2>
              <Text variant="secondary" className="mt-1">
                Talks formats proposed by the conference.
              </Text>
              <div className="mt-4">
                <dl className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                  {event.formats.map((f) => (
                    <div key={f.name} className="py-3 pl-3 pr-4">
                      <Text as="dt" variant="secondary" className="font-semibold">
                        {f.name}
                      </Text>
                      <Text as="dd" className="mt-1">
                        {f.description}
                      </Text>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : null}

          {event.categories.length > 0 ? (
            <div>
              <H2>Categories</H2>
              <Text variant="secondary" className="mt-1">
                Different categories and tracks proposed by the conference.
              </Text>
              <div className="mt-4">
                <dl role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                  {event.categories.map((c) => (
                    <div key={c.name} className="py-3 pl-3 pr-4">
                      <Text as="dt" variant="secondary" className="font-semibold">
                        {c.name}
                      </Text>
                      <Text as="dd" className="mt-1">
                        {c.description}
                      </Text>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : null}
        </Container>
      ) : null}
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="my-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
