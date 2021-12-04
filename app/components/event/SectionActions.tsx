import { GlobeIcon, HeartIcon, MailIcon } from '@heroicons/react/solid';
import { ButtonLink } from '../ui/Buttons';
import { ExternalLink } from '../ui/Links';
import { SectionPanel } from '../ui/Panels';

type SectionActionsProps = {
  bannerUrl: string | null;
  websiteUrl: string | null;
  codeOfConductUrl: string | null;
  contactEmail: string | null;
  cfpState: string | null;
};

export function SectionActions({
  bannerUrl,
  websiteUrl,
  codeOfConductUrl,
  contactEmail,
  cfpState,
}: SectionActionsProps) {
  return (
    <SectionPanel id="event-submission" title="Event links and submission">
      <img
        src={bannerUrl || 'https://placekitten.com/g/800/300'}
        className="w-full object-cover bg-indigo-800 lg:h-64"
        aria-hidden="true"
        alt=""
      />
      <div className="grid grid-cols-1 gap-6 px-4 py-5 sm:px-6">
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
          <ButtonLink to="submission" block>
            Submit a talk
          </ButtonLink>
        )}
      </div>
    </SectionPanel>
  );
}
