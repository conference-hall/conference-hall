import { GlobeIcon, HeartIcon, LocationMarkerIcon, MailIcon } from '@heroicons/react/solid';
import { useCatch, useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { EventDescription, loadEvent } from '~/features/event-page/event.server';
import { ButtonLink } from '../../components/Buttons';
import { Heading } from '../../components/Heading';
import { ExternalLink } from '../../components/Links';
import { Markdown } from '../../components/Markdown';
import { formatCFPDate, formatCFPState } from '../../utils/event';

export const loader = loadEvent;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();
  return (
    <div>
      <section className="py-8 border-b border-gray-200">
        <Container className="flex justify-between items-center flex-wrap sm:flex-nowrap">
          <Heading description={formatCFPDate(data.cfpState, data.cfpStart, data.cfpEnd)}>
            <span className="flex items-center space-x-3">
              <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <span className="h-2 w-2 bg-green-400 rounded-full"></span>
              </span>
              <span className="block">{formatCFPState(data.cfpState)}</span>
            </span>
          </Heading>
          {data.cfpState === 'OPENED' && (
            <div className="flex-shrink-0">
              <ButtonLink to="submission" block>
                Submit a proposal
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      <img
        src={data.bannerUrl || 'https://placekitten.com/g/1200/300'}
        className="w-full object-cover lg:h-64 opacity-80 bg-gray-50"
        height="256px"
        aria-hidden="true"
        alt=""
      />

      <section className="py-16 border-b border-gray-200 bg-gray-50">
        <Container>
          <Markdown source={data.description} />
          {data.websiteUrl || data.contactEmail || data.codeOfConductUrl ? (
            <div className="mt-10 flex space-x-16">
              {data.websiteUrl && (
                <ExternalLink href={data.websiteUrl} icon={GlobeIcon}>
                  Website
                </ExternalLink>
              )}
              {data.contactEmail && (
                <ExternalLink href={`mailto:${data.contactEmail}`} icon={MailIcon}>
                  Contacts
                </ExternalLink>
              )}
              {data.codeOfConductUrl && (
                <ExternalLink href={data.codeOfConductUrl} icon={HeartIcon}>
                  Code of conduct
                </ExternalLink>
              )}
            </div>
          ) : null}
        </Container>
      </section>

      {data.formats.length > 0 || data.categories.length > 0 ? (
        <section className="py-16">
          <Container className="grid grid-cols-2 gap-16">
            {data.formats.length > 0 ? (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Formats</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Talks formats proposed by the conference.</p>
                <div className="mt-4 text-sm text-gray-900">
                  <dl className="border border-gray-200 rounded-md divide-y divide-gray-200 bg-white">
                    {data.formats.map((f) => (
                      <div key={f.name} className="pl-3 pr-4 py-3 text-sm">
                        <dt className="text-sm font-medium text-gray-500">{f.name} </dt>
                        <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{f.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}

            {data.categories.length > 0 ? (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Categories</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Different categories and tracks proposed by the conference.
                </p>
                <div className="mt-4 text-sm text-gray-900">
                  <dl role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200 bg-white">
                    {data.categories.map((c) => (
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
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
