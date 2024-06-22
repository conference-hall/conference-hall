import { Form } from '@remix-run/react';

import type { SurveyQuestions } from '~/.server/cfp-survey/survey-questions';
import { Checkbox, CheckboxGroup } from '~/design-system/forms/Checkboxes.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/RadioGroup.tsx';
import { TextArea } from '~/design-system/forms/TextArea.tsx';

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
              key={question.name}
              name={question.name}
              label={question.label}
              defaultValue={initialValues[question.name] as string}
              rows={5}
            />
          );
        } else if (question.type === 'checkbox') {
          const value = (initialValues[question.name] as string[]) || [];
          return (
            <CheckboxGroup key={question.name} label={question.label} inline>
              {question.answers?.map((answer) => (
                <Checkbox
                  key={answer.name}
                  id={answer.name}
                  name={question.name}
                  value={answer.name}
                  defaultChecked={value.includes(answer.name)}
                >
                  {answer.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          );
        } else if (question.type === 'radio') {
          return (
            <RadioGroup key={question.name} label={question.label} inline>
              {question.answers?.map((answer) => (
                <Radio
                  key={answer.name}
                  id={answer.name}
                  name={question.name}
                  value={answer.name}
                  defaultChecked={initialValues[question.name] === answer.name}
                >
                  {answer.label}
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
