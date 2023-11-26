import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AvatarName } from '~/design-system/Avatar.tsx';
import { Badge } from '~/design-system/Badges.tsx';
import { IconLabel } from '~/design-system/IconLabel.tsx';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon.tsx';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { Text } from '~/design-system/Typography.tsx';
import { ProposalReview } from '~/domains/organizer-cfp-reviews/ProposalReview.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const speakers = await review.getSpeakerInfo();
  return json(speakers);
};

export default function ProposalSpeakersRoute() {
  const speakers = useLoaderData<typeof loader>();

  return (
    <ul aria-label="Speakers list" className="space-y-4">
      {speakers.map((speaker) => {
        const { survey, socials } = speaker;
        const { github, twitter } = socials;

        return (
          <Card as="li" p={8} key={speaker.id} className="space-y-6">
            <div className="flex flex-col gap-4 items-start lg:items-center lg:justify-between lg:flex-row">
              <AvatarName
                name={`${speaker.name} - ${speaker.email}`}
                picture={speaker.picture}
                subtitle={[speaker.company, speaker.address].join(' - ')}
                size="m"
              />
              <div className="flex gap-4">
                {twitter && <IconLabel icon={TwitterIcon}>{twitter}</IconLabel>}
                {github && <IconLabel icon={GitHubIcon}>{github}</IconLabel>}
              </div>
            </div>

            {speaker.bio && <Markdown>{speaker.bio}</Markdown>}

            {speaker.references && (
              <div className="space-y-2">
                <Text weight="medium" mb={2}>
                  References
                </Text>
                <Markdown>{speaker.references}</Markdown>
              </div>
            )}

            {survey && (
              <div className="space-y-2">
                <Text weight="medium">Survey</Text>
                <div className="space-x-4">
                  {survey.gender && <Badge>{survey.gender}</Badge>}
                  {survey.tshirt && <Badge>Tshirt size: {survey.tshirt}</Badge>}
                  {survey.diet && survey.diet.length > 0 && <Badge>{survey.diet.join(', ')}</Badge>}
                  {survey.accomodation === 'yes' && <Badge>Need accommodation fees</Badge>}
                  {survey.transports && survey.transports.length > 0 && (
                    <Badge>Need transport fees: {survey.transports.join(', ')}</Badge>
                  )}
                </div>
              </div>
            )}

            {survey?.info && (
              <div className="space-y-2">
                <Text weight="medium">Additional information</Text>
                <Text>{survey.info}</Text>
              </div>
            )}
          </Card>
        );
      })}
    </ul>
  );
}
