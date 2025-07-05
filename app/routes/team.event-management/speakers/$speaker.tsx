import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { data } from 'react-router';
import { EventSpeakers } from '~/.server/event-speakers/event-speakers.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { SpeakerLinks, SpeakerSurveyAnswers, SpeakerTitle } from '~/routes/components/talks/co-speaker.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { EmptyState } from '~/shared/design-system/layouts/empty-state.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { Markdown } from '~/shared/design-system/markdown.tsx';
import { Text } from '~/shared/design-system/typography.tsx';
import { ProposalItem } from '../components/proposals-page/list/proposal-item.tsx';
import type { Route } from './+types/$speaker.ts';

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
  const { speaker } = loaderData;

  return (
    <Page className="space-y-6">
      <Card>
        <Card.Content className="">
          <SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-16">
            <div className="sm:col-span-2 space-y-4">
              <Markdown>{speaker.bio}</Markdown>
            </div>

            <SpeakerLinks speaker={speaker} />
          </div>
        </Card.Content>

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
