import { GlobeIcon, HeartIcon, MailIcon } from '@heroicons/react/solid';
import { useCatch } from 'remix';
import { Container } from '~/components/layout/Container';
import { useEvent } from '../$eventSlug';
import { ButtonLink } from '../../components/Buttons';
import { CfpHeader } from '../../components/event/CfpInfo';
import { ExternalLink } from '../../components/Links';
import { Markdown } from '../../components/Markdown';

export default function EventRoute() {
  const event = useEvent();
  return (
    <div>
      <section className="py-8 border-b border-gray-200">
        <Container className="flex justify-between items-center flex-wrap sm:flex-nowrap">
          <CfpHeader cfpState={event.cfpState} cfpStart={event.cfpStart} cfpEnd={event.cfpEnd} />
          {event.cfpState === 'OPENED' && (
            <div className="flex-shrink-0">
              <ButtonLink to="submission" block>
                Submit a proposal
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      <img
        src={event.bannerUrl || 'https://placekitten.com/g/1200/300'}
        className="w-full object-cover lg:h-64 opacity-80 bg-gray-50"
        height="256px"
        aria-hidden="true"
        alt=""
      />

      <section className="py-16 border-b border-gray-200 bg-gray-50">
        <Container>
          <Markdown source={event.description} />
          {event.websiteUrl || event.contactEmail || event.codeOfConductUrl ? (
            <div className="mt-10 flex space-x-16">
              {event.websiteUrl && (
                <ExternalLink href={event.websiteUrl} icon={GlobeIcon}>
                  Website
                </ExternalLink>
              )}
              {event.contactEmail && (
                <ExternalLink href={`mailto:${event.contactEmail}`} icon={MailIcon}>
                  Contacts
                </ExternalLink>
              )}
              {event.codeOfConductUrl && (
                <ExternalLink href={event.codeOfConductUrl} icon={HeartIcon}>
                  Code of conduct
                </ExternalLink>
              )}
            </div>
          ) : null}
        </Container>
      </section>

      {event.formats.length > 0 || event.categories.length > 0 ? (
        <section className="py-16">
          <Container className="grid grid-cols-2 gap-16">
            {event.formats.length > 0 ? (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Formats</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Talks formats proposed by the conference.</p>
                <div className="mt-4 text-sm text-gray-900">
                  <dl className="border border-gray-200 rounded-md divide-y divide-gray-200 bg-white">
                    {event.formats.map((f) => (
                      <div key={f.name} className="pl-3 pr-4 py-3 text-sm">
                        <dt className="text-sm font-medium text-gray-500">{f.name} </dt>
                        <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{f.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}

            {event.categories.length > 0 ? (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Categories</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Different categories and tracks proposed by the conference.
                </p>
                <div className="mt-4 text-sm text-gray-900">
                  <dl role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200 bg-white">
                    {event.categories.map((c) => (
                      <div key={c.name} className="pl-3 pr-4 py-3 text-sm">
                        <dt className="text-sm font-medium text-gray-500">{c.name} </dt>
                        <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{c.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}
    </div>
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
