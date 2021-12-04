import { CalendarIcon, GlobeIcon, HeartIcon, LocationMarkerIcon, MailIcon } from '@heroicons/react/solid';
import { useLoaderData } from 'remix';
import { Container } from '~/components/Container';
import { ButtonLink } from '~/components/Buttons';
import { ExternalLink } from '~/components/Links';
import { SectionPanel } from '~/components/Panels';
import { IconLabel } from '~/components/IconLabel';
import { formatCFPDate, formatCFPState, formatConferenceDates } from '~/components/utils/event';
import { EventDescription, getEventDescription } from '~/server/event/get-event-description.server';

export const loader = getEventDescription;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();

  const eventDateFormatted = formatConferenceDates(data.conferenceStart, data.conferenceEnd);
  const cfpStateFormatted = formatCFPState(data.cfpState);
  const cfpDateFormatted = formatCFPDate(data.cfpState, data.cfpStart, data.cfpEnd);

  return (
    <>
      <header className="bg-indigo-900 pb-28">
        <div className="lg:flex lg:items-center lg:justify-between min-w-0 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-white">{data.name}</h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <IconLabel icon={LocationMarkerIcon} className="mt-2 text-indigo-100">
                {data.address}
              </IconLabel>
              {eventDateFormatted && (
                <IconLabel icon={CalendarIcon} className="mt-2 text-indigo-100">
                  {eventDateFormatted}
                </IconLabel>
              )}
            </div>
          </div>
        </div>
      </header>
      <Container className="-mt-24 grid grid-cols-1 items-start lg:grid-cols-3 sm:gap-8">
        <SectionPanel
          id="event-information"
          title="Event information"
          className="lg:col-span-2 grid gap-x-4 gap-y-8"
          padding
        >
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{cfpStateFormatted}</h3>
            {cfpDateFormatted && <p className="mt-1 text-sm text-gray-500">{cfpDateFormatted}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-900">{data.description}</p>
          </div>
          <div>
            <h3 className="text-base leading-6 font-medium text-gray-900">Formats</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Talks formats proposed by the conference.</p>
            <div className="mt-4 text-sm text-gray-900">
              <dl className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {data.formats.map((f) => (
                  <div key={f.name} className="pl-3 pr-4 py-3 text-sm">
                    <dt className="text-sm font-medium text-gray-500">{f.name} </dt>
                    <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{f.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div>
            <h3 className="text-base leading-6 font-medium text-gray-900">Categories</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Different categories and tracks proposed by the conference.
            </p>
            <div className="mt-4 text-sm text-gray-900">
              <dl role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {data.categories.map((c) => (
                  <div key={c.name} className="pl-3 pr-4 py-3 text-sm">
                    <dt className="text-sm font-medium text-gray-500">{c.name} </dt>
                    <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{c.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </SectionPanel>
        <SectionPanel id="event-submission" title="Event links and submission">
          <img
            src={data.bannerUrl || 'https://placekitten.com/g/800/300'}
            className="w-full object-cover lg:h-64"
            aria-hidden="true"
            alt=""
          />
          <div className="grid grid-cols-1 gap-6 px-4 py-5 sm:px-6">
            {data.websiteUrl && (
              <ExternalLink href={data.websiteUrl} icon={GlobeIcon}>
                {data.websiteUrl}
              </ExternalLink>
            )}
            {data.codeOfConductUrl && (
              <ExternalLink href={data.codeOfConductUrl} icon={HeartIcon}>
                Code of conduct
              </ExternalLink>
            )}
            {data.contactEmail && (
              <ExternalLink href={`mailto:${data.contactEmail}`} icon={MailIcon}>
                Contacts
              </ExternalLink>
            )}
            {data.cfpState === 'OPENED' && (
              <ButtonLink to="submission" block>
                Submit a talk
              </ButtonLink>
            )}
          </div>
        </SectionPanel>
      </Container>
    </>
  );
}
