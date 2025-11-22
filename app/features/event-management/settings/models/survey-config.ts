import type { Prisma } from 'prisma/generated/client.ts';
import z from 'zod';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';

export const SurveyQuestionSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(255),
  type: z.enum(['radio', 'checkbox', 'text']),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  required: z.boolean().default(false),
});

const SurveyConfigSchema = z.object({
  enabled: z.boolean(),
  questions: z.array(SurveyQuestionSchema),
});

type SurveyConfigType = z.infer<typeof SurveyConfigSchema>;

export class SurveyConfig {
  public enabled: boolean;
  public questions: Array<SurveyQuestion>;

  constructor(json: Prisma.JsonValue) {
    const result = SurveyConfigSchema.safeParse(json);

    const data = result.success ? result.data : { enabled: false, questions: [] };

    this.enabled = data.enabled;
    this.questions = data.questions;
  }

  get isActiveForEvent() {
    return this.enabled && this.questions.length > 0;
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
