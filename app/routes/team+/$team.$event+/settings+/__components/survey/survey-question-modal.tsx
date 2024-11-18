import { PlusIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import slugify from '@sindresorhus/slugify';
import { type ReactNode, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { SurveyQuestion } from '~/.server/event-survey/types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { Text } from '~/design-system/typography.tsx';

export const QUESTION_TYPES: Array<{ name: string; value: QuestionType }> = [
  { name: 'Free text', value: 'text' },
  { name: 'Multi choice', value: 'checkbox' },
  { name: 'Single choice', value: 'radio' },
];

type QuestionType = 'text' | 'checkbox' | 'radio';

type SurveyModalProps = {
  initialValues?: SurveyQuestion;
  children: (props: { onOpen: () => void }) => ReactNode;
};

// TODO: [survey] Add tests
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
  onClose: () => void;
};

function SurveyQuestionModalContent({ initialValues, open, onClose }: SurveyQuestionModalContentProps) {
  const [type, setType] = useState(initialValues?.type || 'text');
  const [options, setOptions] = useState(initialValues?.options || []);

  const isCreateMode = !initialValues;
  const isOptionsEnabled = ['checkbox', 'radio'].includes(type);
  const canSubmit = (isOptionsEnabled && options.length > 0) || type === 'text';
  const modalTitle = isCreateMode ? 'Add question' : 'Edit question';
  const submitLabel = isCreateMode ? 'Add question' : 'Save question';
  const submitIntent = isCreateMode ? 'add-question' : 'update-question';

  return (
    <Modal title={modalTitle} size="l" open={open} onClose={onClose}>
      <Modal.Content className="space-y-2">
        <Form id="save-question" method="POST" onSubmit={onClose} className="space-y-4">
          <div className="flex items-end gap-2">
            <Input
              name="label"
              label="Question"
              defaultValue={initialValues?.label}
              className="w-full"
              maxLength={255}
              required
            />
            <SelectNative
              name="type"
              label="type"
              value={type}
              onChange={(event) => setType(event.target.value as QuestionType)}
              className="w-36"
              options={QUESTION_TYPES}
              srOnly
            />
          </div>

          {isOptionsEnabled ? <OptionsFieldList options={options} setOptions={setOptions} /> : null}

          <Checkbox id="required" name="required" defaultChecked={initialValues?.required ?? false}>
            This question is required
          </Checkbox>

          <input type="hidden" name="id" value={isCreateMode ? uuid() : initialValues?.id} />
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" name="intent" value={submitIntent} form="save-question" disabled={!canSubmit}>
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
      <Text weight="medium">Answers</Text>

      {options.map((option, index) => (
        <div key={option.id} className="flex gap-2">
          <input type="hidden" name={`options[${index}].id`} value={option.id} />
          <Input
            name={`options[${index}].label`}
            aria-label={`Option ${index}`}
            defaultValue={option.label}
            className="w-full"
            required
            onChange={(event) => handleUpdateOption(index, event.target.value)}
          />
          <Button type="button" variant="important" size="square-m" onClick={() => handleRemoveOption(index)}>
            <TrashIcon className="size-5" aria-label={`Remove answer: ${option.label}`} />
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
        aria-label="New answer"
        placeholder="New answer"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        className="w-full"
        autoFocus
      />
      <Button type="button" variant="secondary" disabled={!label} size="square-m" onClick={handleAddOption}>
        <PlusIcon className="size-5" aria-label="Add answer" />
      </Button>
    </div>
  );
}
