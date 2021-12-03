import { GlobeIcon, HeartIcon, MailIcon } from '@heroicons/react/solid';
import { useLoaderData } from 'remix';
import { Container } from '~/components/Container';
import { ButtonLink } from '~/components/Buttons';
import { ExternalLink } from '~/components/Links';
import { SectionPanel } from '~/components/Panels';
import { EventDescription, getEventDescription } from '~/server/event/get-event-description.server';

export const loader = getEventDescription;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();
  return (
    <Container className="-mt-24 grid grid-cols-1 items-start lg:grid-cols-3 sm:gap-8">
      <SectionPanel
        id="event-information"
        title="Event information"
        className="lg:col-span-2 grid gap-x-4 gap-y-8"
        padding
      >
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Call for paper is open</h3>
          <p className="mt-1 text-sm text-gray-500">Until Thu, 05 Oct 2090 14:48:00 GMT</p>
        </div>
        <div>
          <p className="mt-2 text-sm text-gray-900">{data.description}</p>
        </div>
        <div>
          <h3 className="text-base leading-6 font-medium text-gray-900">Formats</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Talks formats proposed by the conference.</p>
          <div className="mt-4 text-sm text-gray-900">
            <dl className="border border-gray-200 rounded-md divide-y divide-gray-200">
              <div className="pl-3 pr-4 py-3 text-sm">
                <dt className="text-sm font-medium text-gray-500">Conference (45 min)</dt>
                <dd className="mt-1 text-sm text-gray-900 line-clamp-2">
                  Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt
                </dd>
              </div>
              <div className="pl-3 pr-4 py-3 text-sm">
                <dt className="text-sm font-medium text-gray-500">Quickies (20 min)</dt>
                <dd className="mt-1 text-sm text-gray-900 line-clamp-2">
                  Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt
                </dd>
              </div>
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
              <div className="pl-3 pr-4 py-3 text-sm">
                <dt className="text-sm font-medium text-gray-500">Quikies</dt>
                <dd className="mt-1 text-sm text-gray-900 line-clamp-2">
                  Fugiat ipsum ipsum deserunt culpa aute sint do nostrud an
                </dd>
              </div>
              <div className="pl-3 pr-4 py-3 text-sm">
                <dt className="text-sm font-medium text-gray-500">Quikies</dt>
                <dd className="mt-1 text-sm text-gray-900 line-clamp-2">
                  Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.
                  Excepteur qui ipsum aliquip consequat sint.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </SectionPanel>
      <SectionPanel id="event-submission" title="Event links and submission">
        <img
          src="https://pbs.twimg.com/profile_banners/3530607858/1623273738/1500x500"
          className="w-full object-cover lg:h-64"
          aria-hidden="true"
          alt=""
        />
        <div className="grid grid-cols-1 gap-6 px-4 py-5 sm:px-6">
          <ExternalLink href="https://devfest.gdgnantes.com" icon={GlobeIcon}>
            https://devfest.gdgnantes.com
          </ExternalLink>
          <ExternalLink href="https://devfest.gdgnantes.com" icon={HeartIcon}>
            Code of conduct
          </ExternalLink>
          <ExternalLink href="mailto://bureau@gdgnantes.com" icon={MailIcon}>
            Contacts
          </ExternalLink>
          <ButtonLink to="submission" block>
            Submit a talk
          </ButtonLink>
        </div>
      </SectionPanel>
    </Container>
  );
}
