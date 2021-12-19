import { Form, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { Checkbox, CheckboxGroup } from '~/components/forms/Checkboxes';
import { Radio, RadioGroup } from '~/components/forms/RadioGroup';
import { TextArea } from '~/components/forms/TextArea';
import { Heading } from '~/components/Heading';
import { usePreviousStep } from '~/features/event-submission/hooks/usePreviousStep';
import { loadSurvey, saveSurvey, SurveyForm } from '~/features/event-submission/step-survey.server';

export const handle = { step: 'survey' };

export const loader = loadSurvey;

export const action = saveSurvey;

export default function EventSubmitTalkRoute() {
  const { questions, initialValues } = useLoaderData<SurveyForm>();
  const previousStepPath = usePreviousStep();

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:py-10">
        <Heading description="This information will be displayed publicly so be careful what you share.">
          We have some questions for you.
        </Heading>
        <div className="space-y-10">
          {questions.map((question) => {
            if (question.type === 'text') {
              return (
                <TextArea
                  key={question.name}
                  id={question.name}
                  name={question.name}
                  label={question.label}
                  defaultValue={initialValues[question.name] as string}
                  className="mt-6"
                />
              );
            } else if (question.type === 'checkbox') {
              return (
                <CheckboxGroup key={question.name} label={question.label} inline className="mt-6">
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
                <RadioGroup key={question.name} label={question.label} inline className="mt-6">
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
          })}
        </div>
      </div>
      <div className="px-4 py-5 border-t border-gray-200 text-right sm:px-6">
        <ButtonLink to={previousStepPath} variant="secondary">
          Back
        </ButtonLink>
        <Button type="submit" className="ml-4">
          Next
        </Button>
      </div>
    </Form>
  );
}
