import { GlobeIcon, HeartIcon, LocationMarkerIcon, MailIcon } from '@heroicons/react/solid';
import { ExternalLink } from '../../../components/Links';
import cn from 'classnames';
import { ButtonLink } from '../../../components/Buttons';

type SectionActionsProps = {
  address: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  codeOfConductUrl: string | null;
  contactEmail: string | null;
  cfpState: string | null;
  className?: string;
};

export function SectionActions({
  address,
  bannerUrl,
  websiteUrl,
  codeOfConductUrl,
  contactEmail,
  cfpState,
  className,
}: SectionActionsProps) {
  return (
    <section className={cn(className, 'border border-gray-200 shadow-sm rounded-md bg-white')}>
      <img
        src={bannerUrl || 'https://placekitten.com/g/800/300'}
        className="w-full object-cover rounded-t-md bg-indigo-800 lg:h-64"
        aria-hidden="true"
        alt=""
      />
      <div className="grid grid-cols-1 gap-6 px-4 py-5 sm:px-6">
        {address && (
          <ExternalLink
            href={`https://www.google.com/maps/place/${encodeURIComponent(address)}`}
            icon={LocationMarkerIcon}
          >
            {address}
          </ExternalLink>
        )}
        {websiteUrl && (
          <ExternalLink href={websiteUrl} icon={GlobeIcon}>
            {websiteUrl}
          </ExternalLink>
        )}
        {codeOfConductUrl && (
          <ExternalLink href={codeOfConductUrl} icon={HeartIcon}>
            Code of conduct
          </ExternalLink>
        )}
        {contactEmail && (
          <ExternalLink href={`mailto:${contactEmail}`} icon={MailIcon}>
            Contacts
          </ExternalLink>
        )}
        {cfpState === 'OPENED' && (
          <div className="flex-shrink-0">
            <ButtonLink to="submission" block>
              Submit a proposal
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
