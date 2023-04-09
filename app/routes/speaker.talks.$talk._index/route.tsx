import invariant from 'tiny-invariant';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getTalk } from '~/shared-server/talks/get-talk.server';
import { archiveTalk, restoreTalk } from './server/archive-talk.server';
import { ProposalStatusLabel } from '~/shared-components/proposals/ProposalStatusLabel';
import { Link } from '~/design-system/Links';
import { Card } from '~/design-system/Card';
import { AvatarGroup } from '~/design-system/Avatar';
import { IconButtonLink } from '~/design-system/IconButtons';
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { Container } from '~/design-system/Container';
import { H2, H3, Text } from '~/design-system/Typography';
import { Markdown } from '~/design-system/Markdown';
import Badge from '~/design-system/Badges';
import { getLevel } from '~/utils/levels';
import { getLanguage } from '~/utils/languages';
import { ButtonLink } from '~/design-system/Buttons';
import { ArchiveOrRestoreTalkButton } from './components/TalkDelete';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');

  try {
    const talk = await getTalk(uid, params.talk);
    return json(talk);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.talk, 'Invalid talk id');
  const form = await request.formData();
  const action = form.get('_action');

  if (action === 'archive-talk') {
    await archiveTalk(uid, params.talk);
  } else if (action === 'restore-talk') {
    await restoreTalk(uid, params.talk);
  }
  return null;
};

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<typeof loader>();

  return (
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex flex-col flex-wrap sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <IconButtonLink icon={ArrowLeftIcon} variant="secondary" to="/speaker/talks" aria-label="Go back" />
          <H2 mb={0}>{talk.title}</H2>
        </div>

        <div className="flex items-center gap-4">
          <ArchiveOrRestoreTalkButton archived={talk.archived} />
          <ButtonLink iconLeft={PencilSquareIcon} to="edit" variant="secondary">
            Edit
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
        <div className="lg:col-span-2 lg:col-start-1">
          <Card as="section" rounded="xl" p={8} className="space-y-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <AvatarGroup avatars={talk.speakers} displayNames />
              <div className="space-x-4">
                {talk.level && <Badge color="indigo">{getLevel(talk.level)}</Badge>}
                {talk.languages.map((language) => (
                  <Badge key={language}>{getLanguage(language)}</Badge>
                ))}
              </div>
            </div>

            <div>
              <H3 size="base" mb={2}>
                Abstract
              </H3>
              <Markdown source={talk.abstract} />
            </div>

            {talk.references && (
              <div>
                <H3 size="base" mb={2}>
                  References
                </H3>
                <Markdown source={talk.references} />
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1 lg:col-start-3">
          <Card as="section" rounded="xl" p={8} className="space-y-6">
            <H3 mb={0}>Submissions</H3>
            {talk.events.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {talk.events.map((event) => (
                  <li key={event.slug} className="flex items-center gap-2">
                    <ProposalStatusLabel status={event.status} />
                    <Text size="s" variant="secondary">
                      —
                    </Text>
                    <Link to={`/${event.slug}/proposals`}>
                      <Text size="s" variant="link" strong truncate>
                        {event.name}
                      </Text>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Text size="s" variant="secondary">
                No submissions yet.
              </Text>
            )}

            {!talk.archived && (
              <ButtonLink to={`/?talkId=${talk.id}`} block>
                Submit talk
              </ButtonLink>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
