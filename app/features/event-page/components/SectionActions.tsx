import { GlobeIcon, HeartIcon, MailIcon } from '@heroicons/react/solid';
import { ExternalLink } from '../../../components/Links';

type SectionActionsProps = {
  bannerUrl: string | null;
  websiteUrl: string | null;
  codeOfConductUrl: string | null;
  contactEmail: string | null;
};

export function SectionActions({
  bannerUrl,
  websiteUrl,
  codeOfConductUrl,
  contactEmail,
}: SectionActionsProps) {
  return (
    <section className="border border-gray-200 shadow-sm rounded-md bg-white">
      <img
        src={bannerUrl || 'https://placekitten.com/g/800/300'}
        className="w-full object-cover rounded-t-md bg-indigo-800 lg:h-64"
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
      </div>
    </section>
  );
}
