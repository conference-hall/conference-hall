import { PlusIcon } from '@heroicons/react/16/solid';
import { InboxIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { NotFoundError } from '~/shared/errors.server.ts';
import { ProposalItem } from '../proposals/components/list/items/proposal-item.tsx';
import type { Route } from './+types/speaker.ts';
import { SpeakerLinks } from './components/speaker-details/speaker-links.tsx';
import { SpeakerSurveyAnswers } from './components/speaker-details/speaker-survey-answers.tsx';
import { SpeakerTitle } from './components/speaker-details/speaker-title.tsx';
import { EventSpeakers } from './services/event-speakers.server.ts';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const eventSpeakers = EventSpeakers.for(authUser.id, params.team, params.event);
  const speaker = await eventSpeakers.getById(params.speaker);

  if (!speaker) throw new NotFoundError('Speaker not found');

  return { speaker };
};

export default function SpeakerRoute({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const permissions = useUserTeamPermissions();
  const { speaker } = loaderData;

  return (
    <Page className="space-y-4 lg:space-y-6">
      <Page.Heading
        component={<SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />}
      >
        {permissions.canEditEventSpeaker && (
          <Button
            variant="secondary"
            iconLeft={PencilSquareIcon}
            to={href('/team/:team/:event/speakers/:speaker/edit', params)}
          >
            {t('common.edit')}
          </Button>
        )}
      </Page.Heading>

      <Card>
        <SpeakerLinks
          email={speaker.email}
          location={speaker.location}
          socialLinks={speaker.socialLinks}
          className="p-6"
        />

        <Card.Disclosure title={t('speaker.profile.biography')}>
          <Markdown>{speaker.bio || t('common.not-specified')}</Markdown>
        </Card.Disclosure>

        {speaker.references ? (
          <Card.Disclosure title={t('speaker.profile.references')}>
            <Markdown>{speaker.references}</Markdown>
          </Card.Disclosure>
        ) : null}

        {speaker.survey?.length > 0 ? (
          <Card.Disclosure title={t('speaker.survey')} className="space-y-4">
            <SpeakerSurveyAnswers survey={speaker.survey} />
          </Card.Disclosure>
        ) : null}
      </Card>

      <List>
        <List.Header>
          <Text>
            {t('common.proposals')} ({speaker.proposals.length})
          </Text>
          {permissions.canCreateEventProposal && (
            <Button
              variant="secondary"
              iconLeft={PlusIcon}
              to={`${href('/team/:team/:event/proposals/new', params)}?speaker=${speaker.id}`}
            >
              {t('event-management.proposals.new-proposal')}
            </Button>
          )}
        </List.Header>
        <List.Content aria-label={t('event-management.proposals.list')}>
          {speaker.proposals.map((proposal) => (
            <List.Row key={proposal.id} className="px-4 hover:bg-gray-50">
              <ProposalItem
                proposal={proposal}
                linkTo={`/team/${params.team}/${params.event}/proposals/${proposal.id}?speakers=${speaker.id}`}
              />
            </List.Row>
          ))}
          {speaker.proposals.length === 0 ? (
            <EmptyState icon={InboxIcon} label={t('event-management.proposals.empty')} noBorder />
          ) : null}
        </List.Content>
      </List>
    </Page>
  );
}
