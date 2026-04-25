import type { ParseKeys } from 'i18next';

export type SubmissionError = string[] | null;

export type SubmissionErrors = Record<string, SubmissionError> | null | undefined;

export type I18nSubmissionErrors = Record<string, ParseKeys[]> | null | undefined;
