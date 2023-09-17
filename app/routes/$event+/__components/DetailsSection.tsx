import { EnvelopeIcon, GlobeEuropeAfricaIcon, HeartIcon } from '@heroicons/react/20/solid';

import { Card } from '~/design-system/layouts/Card.tsx';
import { ExternalLink } from '~/design-system/Links.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H2 } from '~/design-system/Typography.tsx';

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
      <H2 mb={4}>{type === 'CONFERENCE' ? 'Conference' : 'Meetup'}</H2>

      <Markdown>{description}</Markdown>

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
