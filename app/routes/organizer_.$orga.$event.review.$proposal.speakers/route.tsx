import { AvatarName } from '~/design-system/Avatar';
import { Card } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';
import { IconLabel } from '~/design-system/IconLabel';
import { BuildingLibraryIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon';
import Badge from '~/design-system/badges/Badges';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { getSpeakers } from './server/get-speakers.server';
import { useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const speakers = await getSpeakers(params.event, params.proposal, userId);

  return json(speakers);
};

export default function ProposalSpeakersRoute() {
  const speakers = useLoaderData<typeof loader>();

  return speakers.map((speaker) => {
    const { survey, socials } = speaker;
    const { github, twitter } = socials;
    const displayInfo = speaker.address || speaker.company || twitter || github;

    return (
      <Card p={8} key={speaker.id} className="space-y-8">
        <AvatarName picture={speaker.picture} name={speaker.name} subtitle={speaker.email} size="m" />

        {speaker.bio && <Text size="s">{speaker.bio}</Text>}

        {displayInfo && (
          <div className="flex gap-8">
            {speaker.address && <IconLabel icon={MapPinIcon}>{speaker.address}</IconLabel>}
            {speaker.company && <IconLabel icon={BuildingLibraryIcon}>{speaker.company}</IconLabel>}
            {twitter && <IconLabel icon={TwitterIcon}>{twitter}</IconLabel>}
            {github && <IconLabel icon={GitHubIcon}>{github}</IconLabel>}
          </div>
        )}

        {speaker.references && (
          <div>
            <Text size="s" strong mb={2}>
              References
            </Text>
            <Text size="s">{speaker.references}</Text>
          </div>
        )}

        {survey && (
          <div className="space-y-2">
            <Text size="s" strong mb={2}>
              Survey
            </Text>
            <div className="space-x-4">
              {survey.gender && <Badge>{survey.gender}</Badge>}
              {survey.tshirt && <Badge>Tshirt size: {survey.tshirt}</Badge>}
              {survey.diet && survey.diet.length > 0 && <Badge>{survey.diet.join(', ')}</Badge>}
              {survey.accomodation && <Badge>Need accommodation fees</Badge>}
              {survey.transports && survey.transports.length > 0 && (
                <Badge>Need transport fees: {survey.transports.join(', ')}</Badge>
              )}
            </div>
            {survey.info && (
              <div className="rounded border border-gray-200 p-2 italic">
                <Text size="xs">{survey.info}</Text>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  });
}
