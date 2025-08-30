import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Checkbox, CheckboxGroup } from '~/design-system/forms/input-checkbox.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/radio-group.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';

type Props = {
  id: string;
  questions: Array<SurveyQuestion>;
  initialValues: { [key: string]: unknown };
  errors?: SubmissionErrors;
};

export function SurveyForm({ id, questions, initialValues, errors }: Props) {
  const { t } = useTranslation();

  return (
    <Form id={id} method="POST" className="space-y-10">
      {questions.map((question) => {
        if (question.type === 'text') {
          return (
            <TextArea
              key={question.id}
              name={question.id}
              label={question.label}
              description={question.required ? t('common.required') : t('common.optional')}
              defaultValue={initialValues[question.id] as string}
              error={errors?.[question.id]}
              required={question.required}
              rows={5}
            />
          );
        } else if (question.type === 'checkbox') {
          const value = (initialValues[question.id] as string[]) || [];
          return (
            <CheckboxGroup
              key={question.id}
              label={question.label}
              description={question.required ? t('common.required') : t('common.optional')}
              error={errors?.[question.id]}
              inline={(question.options?.length ?? 0) <= 3}
            >
              {question.options?.map((option) => (
                <Checkbox
                  key={`${question.id}-${option.id}`}
                  name={question.id}
                  value={option.id}
                  defaultChecked={value.includes(option.id)}
                >
                  {option.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          );
        } else if (question.type === 'radio') {
          return (
            <RadioGroup
              key={question.id}
              label={question.label}
              description={question.required ? t('common.required') : t('common.optional')}
              error={errors?.[question.id]}
              inline={(question.options?.length ?? 0) <= 3}
            >
              {question.options?.map((option) => (
                <Radio
                  key={`${question.id}-${option.id}`}
                  name={question.id}
                  value={option.id}
                  defaultChecked={initialValues[question.id] === option.id}
                  required={question.required}
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          );
        }
        return null;
      })}
    </Form>
  );
}
