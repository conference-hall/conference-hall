import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';

type Props = {
  survey?: Array<SurveyDetailedAnswer>;
  className?: string;
};

export function SpeakerSurveyAnswers({ survey, className }: Props) {
  if (!survey || survey.length === 0) {
    return null;
  }

  return survey?.map((question) => (
    <div key={question.id} className={className}>
      <div className="font-medium text-gray-900 text-sm leading-6">{question.label}</div>
      <div className="wrap-break-word text-gray-700 text-sm leading-6">
        {question.type === 'text' ? question.answer : question.answers?.map((a) => a.label).join(', ')}
      </div>
    </div>
  ));
}
