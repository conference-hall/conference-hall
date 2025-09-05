import { InboxIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { data, href } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { ProposalItem } from '../proposals/components/list/items/proposal-item.tsx';
import type { Route } from './+types/speaker.ts';
import { SpeakerLinks } from './components/speaker-details/speaker-links.tsx';
import { SpeakerSurveyAnswers } from './components/speaker-details/speaker-survey-answers.tsx';
import { SpeakerTitle } from './components/speaker-details/speaker-title.tsx';
import { EventSpeakers } from './services/event-speakers.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSpeakers = EventSpeakers.for(userId, params.team, params.event);
  const speaker = await eventSpeakers.getById(params.speaker);

  if (!speaker) {
    throw data(null, { status: 404 });
  }

  return { speaker };
};

export default function SpeakerRoute({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team } = useCurrentEventTeam();
  const { speaker } = loaderData;

  return (
    <Page className="space-y-6">
      <Page.Heading
        component={<SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />}
        backTo={href('/team/:team/:event/speakers', params)}
      >
        {isFeatureEnabled && team.userPermissions?.canEditEventSpeaker && (
          <ButtonLink
            variant="secondary"
            iconLeft={PencilSquareIcon}
            to={href('/team/:team/:event/speakers/:speaker/edit', params)}
          >
            {t('common.edit')}
          </ButtonLink>
        )}
      </Page.Heading>

      <Card>
        <SpeakerLinks
          email={speaker.email}
          location={speaker.location}
          socialLinks={speaker.socialLinks}
          className="p-6"
        />

        <Card.Disclosure title={t('speaker.profile.biography')} defaultOpen>
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
        </List.Header>
        <List.Content aria-label={t('event-management.proposals.list')}>
          {speaker.proposals.map((proposal) => (
            <List.Row key={proposal.id} className="hover:bg-gray-50 px-4">
              <ProposalItem
                proposal={proposal}
                linkTo={`/team/${params.team}/${params.event}/reviews/${proposal.id}?speakers=${speaker.id}`}
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
