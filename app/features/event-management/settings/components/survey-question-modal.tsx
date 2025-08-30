import { PlusIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import slugify from '@sindresorhus/slugify';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { v4 as uuid } from 'uuid';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';

type QuestionType = 'text' | 'checkbox' | 'radio';

const QUESTION_TYPES: Array<QuestionType> = ['text', 'checkbox', 'radio'] as const;

type SurveyModalProps = { initialValues?: SurveyQuestion; children: (props: { onOpen: VoidFunction }) => ReactNode };

export function SurveyQuestionModal({ initialValues, children }: SurveyModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children({ onOpen: () => setOpen(true) })}

      <SurveyQuestionModalContent
        key={String(open)}
        initialValues={initialValues}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

type SurveyQuestionModalContentProps = {
  initialValues?: SurveyQuestion;
  open: boolean;
  onClose: VoidFunction;
};

function SurveyQuestionModalContent({ initialValues, open, onClose }: SurveyQuestionModalContentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const [type, setType] = useState(initialValues?.type || 'text');
  const [options, setOptions] = useState(initialValues?.options || []);

  const isCreateMode = !initialValues;
  const isOptionsEnabled = ['checkbox', 'radio'].includes(type);
  const canSubmit = (isOptionsEnabled && options.length > 0) || type === 'text';
  const modalTitle = isCreateMode
    ? t('event-management.settings.survey.add-question')
    : t('event-management.settings.survey.edit-question');
  const submitLabel = isCreateMode
    ? t('event-management.settings.survey.add-question')
    : t('event-management.settings.survey.save-question');
  const submitIntent = isCreateMode ? 'add-question' : 'update-question';

  return (
    <Modal title={modalTitle} size="l" open={open} onClose={onClose}>
      <Modal.Content className="space-y-2">
        <Form id={formId} method="POST" onSubmit={onClose} className="space-y-4">
          <div className="flex items-end gap-2">
            <Input
              name="label"
              label={t('event-management.settings.survey.question.label')}
              defaultValue={initialValues?.label}
              className="w-full"
              maxLength={255}
              required
            />
            <SelectNative
              name="type"
              label={t('event-management.settings.survey.question.type')}
              value={type}
              onChange={(event) => setType(event.target.value as QuestionType)}
              className="w-36"
              options={QUESTION_TYPES.map((type) => ({
                value: type,
                name: t(`event-management.settings.survey.question-types.${type}`),
              }))}
              srOnly
            />
          </div>

          {isOptionsEnabled ? <OptionsFieldList options={options} setOptions={setOptions} /> : null}

          <Checkbox name="required" defaultChecked={initialValues?.required ?? false}>
            {t('event-management.settings.survey.question.required')}
          </Checkbox>

          <input type="hidden" name="id" value={isCreateMode ? uuid() : initialValues?.id} />
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value={submitIntent} form={formId} disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

type OptionsFieldListProps = {
  options: { id: string; label: string }[];
  setOptions: React.Dispatch<React.SetStateAction<{ id: string; label: string }[]>>;
};

function OptionsFieldList({ options, setOptions }: OptionsFieldListProps) {
  const { t } = useTranslation();

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...options[index], label: value };
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <Text weight="medium">{t('event-management.settings.survey.answers.label')}</Text>

      {options.map((option, index) => (
        <div key={option.id} className="flex gap-2">
          <input type="hidden" name={`options[${index}].id`} value={option.id} />
          <Input
            name={`options[${index}].label`}
            aria-label={t('event-management.settings.survey.answers.option', { index: index + 1 })}
            defaultValue={option.label}
            className="w-full"
            required
            onChange={(event) => handleUpdateOption(index, event.target.value)}
          />
          <Button
            type="button"
            aria-label={t('event-management.settings.survey.answers.remove', { label: option.label })}
            variant="important"
            size="square-m"
            onClick={() => handleRemoveOption(index)}
          >
            <TrashIcon className="size-5" aria-hidden="true" />
          </Button>
        </div>
      ))}

      <NewOptionInput setOptions={setOptions} />
    </div>
  );
}

type NewOptionInputProps = {
  setOptions: React.Dispatch<React.SetStateAction<{ id: string; label: string }[]>>;
};

function NewOptionInput({ setOptions }: NewOptionInputProps) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');

  const handleAddOption = () => {
    if (!label) return;
    const id = slugify(label);
    if (!id) return;
    setOptions((options) => [...options, { id, label: label }]);
    setLabel('');
  };

  return (
    <div className="flex gap-2">
      <Input
        aria-label={t('event-management.settings.survey.answers.new')}
        placeholder={t('event-management.settings.survey.answers.new')}
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        className="w-full"
        autoFocus
      />
      <Button
        type="button"
        variant="secondary"
        aria-label={t('event-management.settings.survey.answers.add-answer')}
        disabled={!label}
        size="square-m"
        onClick={handleAddOption}
      >
        <PlusIcon className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
