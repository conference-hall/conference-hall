import type { LoaderArgs } from '@remix-run/node';
import { useProposalReview } from '../organizer_.$orga.$event.review.$proposal/route';
import { AvatarName } from '~/design-system/Avatar';
import { Card } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';
import { IconLabel } from '~/design-system/IconLabel';
import { BuildingLibraryIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon';
import Badge from '~/design-system/badges/Badges';

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export default function ProposalReviewRoute() {
  const { proposalReview } = useProposalReview();

  return proposalReview.proposal.speakers.map((speaker) => {
    const { github, twitter } = speaker.socials;
    const displayInfo = speaker.address || speaker.company || twitter || github;

    return (
      <Card p={8} key={speaker.id} className="space-y-8">
        <AvatarName picture={speaker.picture} name={speaker.name} subtitle={speaker.email} size="l" />

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

        <div>
          <Text size="s" strong mb={2}>
            Survey
          </Text>
          <div className="space-x-4">
            <Badge>Male</Badge>
            <Badge>Size L</Badge>
            <Badge>Need accommodation</Badge>
          </div>
        </div>
      </Card>
    );
  });
}
