import type { SubmissionErrors } from '@conference-hall/shared/types/errors.types.ts';
import type { SurveyQuestion } from '@conference-hall/shared/types/survey.types.ts';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { FieldsetGroup } from '~/design-system/forms/fieldset-group.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { Radio } from '~/design-system/forms/input-radio.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';

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
              hint={question.required ? t('common.required') : t('common.optional')}
              defaultValue={initialValues[question.id] as string}
              error={errors?.[question.id]}
              required={question.required}
              rows={5}
            />
          );
        } else if (question.type === 'checkbox') {
          const value = (initialValues[question.id] as string[]) || [];
          return (
            <FieldsetGroup
              key={question.id}
              legend={question.label}
              hint={question.required ? t('common.required') : t('common.optional')}
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
            </FieldsetGroup>
          );
        } else if (question.type === 'radio') {
          return (
            <FieldsetGroup
              key={question.id}
              legend={question.label}
              hint={question.required ? t('common.required') : t('common.optional')}
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
            </FieldsetGroup>
          );
        }
        return null;
      })}
    </Form>
  );
}
