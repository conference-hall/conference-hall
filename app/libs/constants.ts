export const EVENT_TYPES = ['CONFERENCE', 'MEETUP'] as const;

export const EVENT_VISIBILITY = ['PRIVATE', 'PUBLIC'] as const;

export const TALK_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export const TEAM_ROLES = ['OWNER', 'MEMBER', 'REVIEWER'] as const;

export const LANGUAGES = [
  'ar',
  'bn',
  'zh',
  'en',
  'fr',
  'de',
  'hi',
  'id',
  'it',
  'ja',
  'jv',
  'ko',
  'mr',
  'pl',
  'pt',
  'pa',
  'ru',
  'es',
  'ta',
  'te',
  'th',
  'tr',
  'ur',
  'vi',
] as const;

export const EMAIL_TYPE_LABELS = {
  PROPOSAL_SUBMITTED: {
    key: 'proposal-submitted',
    i18nKey: 'event-management.settings.emails.types.proposal-submitted',
  },
  PROPOSAL_ACCEPTED: {
    key: 'proposal-accepted',
    i18nKey: 'event-management.settings.emails.types.proposal-accepted',
  },
  PROPOSAL_DECLINED: {
    key: 'proposal-declined',
    i18nKey: 'event-management.settings.emails.types.proposal-declined',
  },
} as const;
