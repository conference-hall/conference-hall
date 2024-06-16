import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ProposalReview } from '~/.server/reviews/ProposalReview';
import { Avatar } from '~/design-system/Avatar';
import { IconExternalLink } from '~/design-system/IconButtons';
import { GitHubIcon } from '~/design-system/icons/GitHubIcon';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon';
import SlideOver from '~/design-system/SlideOver.tsx';
import { Text } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal slug');
  invariant(params.speaker, 'Invalid speaker slug');

  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const speaker = await review.getSpeakerInfo(params.speaker);

  return json(speaker);
};

export default function ProposalSpeakerRoute() {
  const speaker = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const Title = () => <SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />;

  const details = [
    { label: 'Biography', value: speaker.bio },
    { label: 'References', value: speaker.references },
    { label: 'Location', value: speaker.address },
    { label: 'Gender', value: speaker.survey?.gender },
    { label: 'Tshirt size', value: speaker.survey?.tshirt },
    { label: 'Diet', value: speaker.survey?.diet?.join(', ') },
    { label: 'Need accomodation fees', value: speaker.survey?.accomodation },
    { label: 'Need Transport fees', value: speaker.survey?.transports?.join(', ') },
    { label: 'More information', value: speaker.survey?.info },
  ].filter((detail) => Boolean(detail.value));

  return (
    <SlideOver open onClose={onClose} size="l">
      <SlideOver.Content title={<Title />} onClose={onClose} className="!p-0 border-t border-t-gray-200 divide-y">
        <div className="flex items-center gap-4 py-6 px-4 sm:px-6">
          <div className="flex-1 overflow-hidden">
            <Text size="base" variant="secondary" truncate>
              {speaker.email}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            {speaker.socials.twitter && (
              <IconExternalLink
                href={`https://twitter.com/${speaker.socials.twitter}`}
                icon={TwitterIcon}
                label="Twitter link"
                variant="secondary"
              />
            )}
            {speaker.socials.github && (
              <IconExternalLink
                href={`https://github.com/${speaker.socials.github}`}
                icon={GitHubIcon}
                label="Github link"
                variant="secondary"
              />
            )}
          </div>
        </div>
        <dl className="divide-y">
          {details.map((detail) => (
            <div key={detail.label} className="px-4 py-6 sm:px-6">
              <dt className="text-sm font-medium leading-6 text-gray-900">{detail.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </SlideOver.Content>
    </SlideOver>
  );
}

type SpeakerTitleProps = { name: string | null; picture: string | null; company: string | null };

function SpeakerTitle({ name, picture, company }: SpeakerTitleProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar picture={picture} name={name} size="l" />

      <div className="overflow-hidden">
        <Text weight="semibold" size="xl" truncate>
          {name}
        </Text>
        <Text variant="secondary" truncate>
          {company}
        </Text>
      </div>
    </div>
  );
}
