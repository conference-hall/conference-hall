import { Form } from '@remix-run/react';

import { Checkbox, CheckboxGroup } from '~/design-system/forms/checkboxes.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/radio-group.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import type { SurveyQuestions } from '~/types/survey.types.ts';

export type Props = {
  id: string;
  questions: SurveyQuestions;
  initialValues: { [key: string]: unknown };
};

export function SurveyForm({ id, questions, initialValues }: Props) {
  return (
    <Form id={id} method="POST" className="space-y-10">
      {questions.map((question) => {
        if (question.type === 'text') {
          return (
            <TextArea
              key={question.id}
              name={question.id}
              label={question.label}
              defaultValue={initialValues[question.id] as string}
              rows={5}
            />
          );
        } else if (question.type === 'checkbox') {
          const value = (initialValues[question.id] as string[]) || [];
          return (
            <CheckboxGroup key={question.id} label={question.label} inline>
              {question.options?.map((option) => (
                <Checkbox
                  key={option.id}
                  id={option.id}
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
            <RadioGroup key={question.id} label={question.label} inline>
              {question.options?.map((option) => (
                <Radio
                  key={option.id}
                  id={option.id}
                  name={question.id}
                  value={option.id}
                  defaultChecked={initialValues[question.id] === option.id}
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
