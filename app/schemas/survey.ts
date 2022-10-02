export type SurveyQuestions = Array<{
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'radio';
  answers?: Array<{ name: string; label: string }>;
}>;
