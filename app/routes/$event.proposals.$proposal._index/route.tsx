import invariant from 'tiny-invariant';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getSpeakerProposal } from '~/shared-server/proposals/get-speaker-proposal.server';
import { removeCoSpeakerFromProposal } from '~/shared-server/proposals/remove-co-speaker.server';
import { Card } from '~/design-system/Card';
import { AvatarGroup } from '~/design-system/Avatar';
import { IconButton } from '~/design-system/IconButtons';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ProposalStatusPanel } from '~/shared-components/proposals/ProposalStatusPanel';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { useEvent } from '../$event/route';
import { H2, H3, Text } from '~/design-system/Typography';
import { Markdown } from '~/design-system/Markdown';
import Badge from '~/design-system/Badges';
import { getLevel } from '~/utils/levels';
import { getLanguage } from '~/utils/languages';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.proposal, 'Invalid proposal id');

  const proposal = await getSpeakerProposal(params.proposal, uid).catch(mapErrorToResponse);
  return json(proposal);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  try {
    const action = form.get('_action');
    if (action === 'remove-speaker') {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await removeCoSpeakerFromProposal(uid, params.proposal, speakerId);
      return null;
    }
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function ProposalRoute() {
  const event = useEvent();
  const proposal = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex items-start gap-4">
        <IconButton icon={ArrowLeftIcon} variant="secondary" onClick={() => navigate(-1)} aria-label="Go back" />
        <H2 mb={0}>{proposal.title}</H2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
        <div className="lg:col-span-2 lg:col-start-1">
          <Card as="section" rounded="xl" p={8} className="space-y-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <AvatarGroup avatars={proposal.speakers} displayNames />
              <div className="space-x-4">
                {proposal.level && <Badge color="indigo">{getLevel(proposal.level)}</Badge>}
                {proposal.languages.map((language) => (
                  <Badge key={language}>{getLanguage(language)}</Badge>
                ))}
              </div>
            </div>

            <div>
              <H3 size="base" mb={2}>
                Abstract
              </H3>
              <Markdown source={proposal.abstract} />
            </div>

            {proposal.formats.length > 0 && (
              <div>
                <H3 size="base" mb={2}>
                  Formats
                </H3>
                <Text size="s">{proposal.formats.map(({ name }) => name).join(', ') || '—'}</Text>
              </div>
            )}

            {proposal.categories.length > 0 && (
              <div>
                <H3 size="base" mb={2}>
                  Categories
                </H3>
                <Text size="s">{proposal.categories.map(({ name }) => name).join(', ') || '—'}</Text>
              </div>
            )}

            {proposal.references && (
              <div>
                <H3 size="base" mb={2}>
                  References
                </H3>
                <Markdown source={proposal.references} className="mt-2" />
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1 lg:col-start-3">
          <ProposalStatusPanel proposal={proposal} event={event} />
        </div>
      </div>
    </Container>
  );
}
