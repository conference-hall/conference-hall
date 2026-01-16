import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from '@heroicons/react/16/solid';
import { Trans, useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import type { SerializeFrom } from '~/shared/types/react-router.types.ts';
import { Badge } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/button.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import type { action, loader } from '../survey.tsx';
import { SurveyQuestionModal } from './survey-question-modal.tsx';

const MAX_QUESTIONS = 8;

export type SurveySettingsFormProps = { config: SerializeFrom<typeof loader> };

export function SurveySettingsForm({ config }: SurveySettingsFormProps) {
  const { t } = useTranslation();
  const { questions } = config;

  const toggleSurveyFetcher = useFetcher<typeof action>({ key: 'toggle-survey' });
  const moveQuestionFetcher = useFetcher<typeof action>({ key: 'move-question' });
  const removeQuestionFetcher = useFetcher<typeof action>({ key: 'remove-question' });

  const handleMoveQuestion = (id: string, direction: 'up' | 'down') => () => {
    moveQuestionFetcher.submit({ intent: 'move-question', id, direction }, { method: 'POST' });
  };

  const handleRemoveQuestion = (id: string) => () => {
    if (!confirm(t('event-management.settings.survey.confirm-delete'))) return;
    removeQuestionFetcher.submit({ intent: 'remove-question', id }, { method: 'POST' });
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
          onChange={() => toggleSurveyFetcher.submit({ intent: 'toggle-survey' }, { method: 'POST' })}
        />

        <List>
          <List.Header className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex grow items-baseline gap-2">
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
                  size="sm"
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
                className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:justify-between"
              >
                <div className="grow space-y-0.5">
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
                    label="Move up"
                    icon={ArrowUpIcon}
                    onClick={handleMoveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    variant="secondary"
                    size="sm"
                  />
                  <Button
                    label="Move down"
                    icon={ArrowDownIcon}
                    onClick={handleMoveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    variant="secondary"
                    size="sm"
                  />
                  <SurveyQuestionModal initialValues={question}>
                    {({ onOpen }) => (
                      <Button onClick={onOpen} variant="secondary" size="sm">
                        {t('common.edit')}
                      </Button>
                    )}
                  </SurveyQuestionModal>
                  <Button variant="important" size="sm" onClick={handleRemoveQuestion(question.id)}>
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
