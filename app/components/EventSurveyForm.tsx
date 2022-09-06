import { Checkbox, CheckboxGroup } from '../design-system/forms/Checkboxes';
import { Radio, RadioGroup } from '../design-system/forms/RadioGroup';
import { TextArea } from '../design-system/forms/TextArea';
import type { SurveyQuestions } from '../services/events/survey.server';

export type Props = {
  questions: SurveyQuestions;
  initialValues: { [key: string]: string | string[] | null };
};

export function EventSurveyForm({ questions, initialValues }: Props) {
  return (
    <div className="space-y-10">
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
          return (
            <CheckboxGroup key={question.name} label={question.label} inline>
              {question.answers?.map((answer) => (
                <Checkbox
                  key={answer.name}
                  id={answer.name}
                  name={question.name}
                  value={answer.name}
                  defaultChecked={initialValues[question.name]?.includes(answer.name)}
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
    </div>
  );
}
