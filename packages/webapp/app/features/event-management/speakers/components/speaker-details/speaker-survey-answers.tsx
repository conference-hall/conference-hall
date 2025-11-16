import type { SurveyDetailedAnswer } from '@conference-hall/shared/types/survey.types.ts';

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
      <div className="text-sm font-medium leading-6 text-gray-900">{question.label}</div>
      <div className="text-sm leading-6 text-gray-700 break-words">
        {question.type === 'text' ? question.answer : question.answers?.map((a) => a.label).join(', ')}
      </div>
    </div>
  ));
}
