import type { JsonValue } from '@prisma/client/runtime/library';
import { SurveyConfigSchema, type SurveyConfigType, type SurveyQuestion } from '../types.ts';
import { defaultQuestions } from './default-survey-questions.ts';

// TODO: [survey] Add tests
export class SurveyConfig {
  public enabled: boolean;
  public questions: Array<SurveyQuestion>;

  constructor(json: JsonValue) {
    const result = SurveyConfigSchema.safeParse(json);
    const data = result.success ? result.data : { enabled: false, questions: defaultQuestions };

    this.enabled = data.enabled;
    this.questions = data.questions;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  addQuestion(question: SurveyQuestion) {
    this.questions.push(question);
  }

  updateQuestion(question: SurveyQuestion) {
    const index = this.questions.findIndex((q) => q.id === question.id);
    if (index === -1) return;
    this.questions[index] = question;
  }

  removeQuestion(questionId: string) {
    this.questions = this.questions.filter((question) => question.id !== questionId);
  }

  moveQuestion(questionId: string, direction: 'up' | 'down') {
    const index = this.questions.findIndex((q) => q.id === questionId);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.questions.length) return;
    const [question] = this.questions.splice(index, 1);
    this.questions.splice(newIndex, 0, question);
  }

  toConfig(): SurveyConfigType {
    const result = SurveyConfigSchema.safeParse(this);
    if (!result.success) return { enabled: false, questions: [] };
    return { enabled: this.enabled, questions: this.questions };
  }
}
