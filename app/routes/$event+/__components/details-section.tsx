import { EnvelopeIcon, GlobeEuropeAfricaIcon, HeartIcon } from '@heroicons/react/20/solid';

import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import type { CfpState } from '~/types/events.types.ts';

import { CfpSection } from './cfp-section.tsx';

type Props = {
  description: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  codeOfConductUrl: string | null;
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
  className?: string;
};

export function DetailsSection({
  description,
  websiteUrl,
  contactEmail,
  codeOfConductUrl,
  cfpState,
  cfpStart,
  cfpEnd,
}: Props) {
  const hasDetails = websiteUrl || contactEmail || codeOfConductUrl;
  return (
    <Card as="section" p={8} className="space-y-8">
      <CfpSection cfpState={cfpState} cfpStart={cfpStart} cfpEnd={cfpEnd} />

      <Markdown>{description}</Markdown>

      {hasDetails && (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-16">
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
