export type DeliberationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type PublicationStatus = 'NOT_PUBLISHED' | 'PUBLISHED';

export type ConfirmationStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';

export type ReviewFeeling = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'NO_OPINION';

export type GlobalReview = { negatives: number; positives: number; average: number | null };

export type UserReview = { feeling: ReviewFeeling | null; note: number | null };
