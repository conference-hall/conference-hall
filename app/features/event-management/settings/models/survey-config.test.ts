import { describe, expect, it } from 'vitest';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';
import { SurveyConfig } from './survey-config.ts';

describe('SurveyConfig', () => {
  const question: SurveyQuestion = { id: 'q1', label: 'Sample question', type: 'text', required: false };

  it('initializes with default values if invalid JSON is provided', () => {
    const config = new SurveyConfig({});
    expect(config.enabled).toBe(false);
    expect(config.questions).toHaveLength(0);
  });

  it('initializes with provided JSON values', () => {
    const json = { enabled: true, questions: [question] };
    const config = new SurveyConfig(json);
    expect(config.enabled).toBe(true);
    expect(config.questions).toHaveLength(1);
    expect(config.questions[0]).toEqual(question);
  });

  it('toggles the enabled state', () => {
    const config = new SurveyConfig({ enabled: true, questions: [] });
    config.toggle();
    expect(config.enabled).toBe(false);
    config.toggle();
    expect(config.enabled).toBe(true);
  });

  it('adds a question', () => {
    const config = new SurveyConfig({ enabled: true, questions: [] });
    config.addQuestion(question);
    expect(config.questions).toHaveLength(1);
    expect(config.questions[0]).toEqual(question);
  });

  it('updates a question', () => {
    const updatedQuestion = { ...question, label: 'Updated question' };
    const config = new SurveyConfig({ enabled: true, questions: [question] });
    config.updateQuestion(updatedQuestion);
    expect(config.questions[0].label).toBe('Updated question');
  });

  it('removes a question', () => {
    const config = new SurveyConfig({ enabled: true, questions: [question] });
    config.removeQuestion(question.id);
    expect(config.questions).toHaveLength(0);
  });

  it('moves a question up', () => {
    const question2: SurveyQuestion = { id: 'q2', label: 'Second question', type: 'text', required: false };
    const config = new SurveyConfig({ enabled: true, questions: [question, question2] });
    config.moveQuestion(question2.id, 'up');
    expect(config.questions[0]).toEqual(question2);
    expect(config.questions[1]).toEqual(question);
  });

  it('moves a question down', () => {
    const question2: SurveyQuestion = { id: 'q2', label: 'Second question', type: 'text', required: false };
    const config = new SurveyConfig({ enabled: true, questions: [question, question2] });
    config.moveQuestion(question.id, 'down');
    expect(config.questions[0]).toEqual(question2);
    expect(config.questions[1]).toEqual(question);
  });

  it('returns a valid config', () => {
    const config = new SurveyConfig({ enabled: true, questions: [question] });
    const result = config.toConfig();
    expect(result).toEqual({
      enabled: true,
      questions: [question],
    });
  });
});
