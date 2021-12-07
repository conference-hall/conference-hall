import { Form, useLoaderData, useParams } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { Checkbox, CheckboxGroup } from '../../../components/forms/Checkboxes';
import { Radio, RadioGroup } from '../../../components/forms/RadioGroup';
import { TextArea } from '../../../components/forms/TextArea';
import { Heading } from '../../../components/Heading';
import { usePreviousStep } from '../../../features/event-submission/hooks/usePreviousStep';
import { loadSurveyQuestions } from '../../../features/event-submission/load-survey-questions';
import { saveSurvey } from '../../../features/event-submission/save-survey.server';
import { SurveyQuestions } from '../../../services/survey/questions';

export const handle = { step: 'survey' };

export const loader = loadSurveyQuestions;

export const action = saveSurvey;

export default function EventSubmitTalkRoute() {
  const questions = useLoaderData<SurveyQuestions>();
  const previousStepPath = usePreviousStep()

  return (
    <Form method="post">
      <div className="px-8 py-6 sm:px-8 lg:w-8/12">
        <Heading description="This information will be displayed publicly so be careful what you share.">
          We have some questions for you.
        </Heading>
        {questions.map((question) => {
          if (question.type === 'text') {
            return (
              <TextArea
                key={question.name}
                id={question.name}
                name={question.name}
                label={question.label}
                className="mt-6"
              />
            );
          } else if (question.type === 'checkbox') {
            return (
              <CheckboxGroup key={question.name} label={question.label} inline className="mt-6">
                {question.answers?.map((answer) => (
                  <Checkbox key={answer.name} id={answer.name} name={question.name} value={answer.name}>
                    {answer.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            );
          } else if (question.type === 'radio') {
            return (
              <RadioGroup key={question.name} label={question.label} inline className="mt-6">
                {question.answers?.map((answer) => (
                  <Radio key={answer.name} id={answer.name} name={question.name} value={answer.name}>
                    {answer.label}
                  </Radio>
                ))}
              </RadioGroup>
            );
          }
        })}
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
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
