import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Trans, useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { Badge } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import type { SerializeFrom } from '~/types/react-router.types.ts';
import type { action, loader } from '../../../settings/survey.tsx';
import { SurveyQuestionModal } from './survey-question-modal.tsx';

const MAX_QUESTIONS = 8;

export type SurveySettingsFormProps = { config: SerializeFrom<typeof loader> };

export function SurveySettingsForm({ config }: SurveySettingsFormProps) {
  const { t } = useTranslation();
  const { questions } = config;

  const fetcher = useFetcher<typeof action>();

  const handleMoveQuestion = (id: string, direction: 'up' | 'down') => () => {
    fetcher.submit({ intent: 'move-question', id, direction }, { method: 'POST' });
  };

  const handleRemoveQuestion = (id: string) => () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    fetcher.submit({ intent: 'remove-question', id }, { method: 'POST' });
  };

  return (
    <Card as="section">
      <Card.Title className="flex items-center gap-3">
        <H2>{t('event-management.settings.survey.heading')}</H2>
      </Card.Title>

      <Card.Content>
        <ToggleGroup
          label={t('event-management.settings.survey.toggle.label')}
          description={t('event-management.settings.survey.toggle.description')}
          value={config.enabled}
          onChange={() => fetcher.submit({ intent: 'toggle-survey' }, { method: 'POST' })}
        />

        <List>
          <List.Header className="flex justify-between">
            <div className="flex items-baseline gap-2">
              <Text weight="medium">
                {t('event-management.settings.survey.questions', { count: questions.length })}
              </Text>
              <Text size="xs" variant="secondary">
                {t('event-management.settings.survey.max-questions', { max: MAX_QUESTIONS })}
              </Text>
            </div>
            <SurveyQuestionModal>
              {({ onOpen }) => (
                <Button
                  onClick={onOpen}
                  variant="primary"
                  size="s"
                  iconLeft={PlusIcon}
                  disabled={questions.length >= MAX_QUESTIONS}
                >
                  {t('event-management.settings.survey.add-question')}
                </Button>
              )}
            </SurveyQuestionModal>
          </List.Header>

          <List.Content aria-label={t('event-management.settings.survey.list.label')}>
            {questions.map((question, index) => (
              <List.Row
                key={question.id}
                className="p-4 flex flex-col items-start gap-4 sm:flex-row sm:justify-between"
              >
                <div className="space-y-0.5 grow">
                  <div className="flex gap-2">
                    <Text>
                      {question.label}
                      {question.required ? <span className="text-red-600"> *</span> : null}
                    </Text>
                    <Badge color="gray" compact>
                      {t(`event-management.settings.survey.question-types.${question.type}`)}
                    </Badge>
                  </div>
                  {['checkbox', 'radio'].includes(question.type) ? (
                    <Text size="xs" variant="secondary">
                      {question.options?.map((o) => o.label)?.join(', ')}
                    </Text>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="square-s"
                    disabled={index === 0}
                    onClick={handleMoveQuestion(question.id, 'up')}
                  >
                    <ArrowUpIcon className="size-4" arial-label="Move up" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="square-s"
                    disabled={index === questions.length - 1}
                    onClick={handleMoveQuestion(question.id, 'down')}
                  >
                    <ArrowDownIcon className="size-4" arial-label="Move down" />
                  </Button>
                  <SurveyQuestionModal initialValues={question}>
                    {({ onOpen }) => (
                      <Button onClick={onOpen} variant="secondary" size="s">
                        {t('common.edit')}
                      </Button>
                    )}
                  </SurveyQuestionModal>
                  <Button variant="important" size="s" onClick={handleRemoveQuestion(question.id)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </List.Row>
            ))}
          </List.Content>

          <List.Footer>
            <Text size="xs" variant="secondary">
              <Trans
                i18nKey="event-management.settings.survey.required-questions"
                components={[<span key="1" className="text-red-600" />]}
              />
            </Text>
          </List.Footer>
        </List>
      </Card.Content>
    </Card>
  );
}
