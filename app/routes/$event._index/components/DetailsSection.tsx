import { EnvelopeIcon, GlobeEuropeAfricaIcon, HeartIcon } from '@heroicons/react/20/solid';
import { ExternalLink } from '~/design-system/Links';
import { Markdown } from '~/design-system/Markdown';
import { H2 } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';

type Props = {
  type: 'CONFERENCE' | 'MEETUP';
  description: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  codeOfConductUrl: string | null;
};

export function DetailsSection({ type, description, websiteUrl, contactEmail, codeOfConductUrl }: Props) {
  const hasDetails = websiteUrl || contactEmail || codeOfConductUrl;
  return (
    <Card as="section" p={8}>
      <H2 size="base" mb={4}>
        {type === 'CONFERENCE' ? 'Conference' : 'Meetup'}
      </H2>

      <Markdown source={description} />

      {hasDetails && (
        <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:gap-16">
          {websiteUrl && (
            <ExternalLink href={websiteUrl} icon={GlobeEuropeAfricaIcon}>
              Website
            </ExternalLink>
          )}
          {contactEmail && (
            <ExternalLink href={`mailto:${contactEmail}`} icon={EnvelopeIcon}>
              Contacts
            </ExternalLink>
          )}
          {codeOfConductUrl && (
            <ExternalLink href={codeOfConductUrl} icon={HeartIcon}>
              Code of conduct
            </ExternalLink>
          )}
        </div>
      )}
    </Card>
  );
}
