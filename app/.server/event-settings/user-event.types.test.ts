import {
  CfpConferenceOpeningSchema,
  EventDetailsSettingsSchema,
  EventGeneralSettingsSchema,
} from './user-event.types.ts';

describe('UserEvent types', () => {
  describe('#EventGeneralSettingsSchema', () => {
    it('validates valid inputs', async () => {
      const result = await EventGeneralSettingsSchema.safeParseAsync({
        name: 'Event name',
        visibility: 'PUBLIC',
        slug: 'event-name',
        timezone: 'Europe/Paris',
      });

      expect(result.success && result.data).toEqual({
        name: 'Event name',
        slug: 'event-name',
        visibility: 'PUBLIC',
        timezone: 'Europe/Paris',
      });
    });

    it('returns validation errors', async () => {
      const result = await EventGeneralSettingsSchema.safeParseAsync({ name: '', visibility: 'toto', slug: '!@#' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name).toEqual(['String must contain at least 3 character(s)']);
        expect(fieldErrors.slug).toEqual(['Must only contain lower case alphanumeric and dashes (-).']);
        expect(fieldErrors.visibility).toEqual(["Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'"]);
      }
    });
  });

  describe('#EventDetailsSettingsSchema', () => {
    it('validates EventDetailsSettingsSchema inputs and transform dates with TZ', async () => {
      const result = EventDetailsSettingsSchema.safeParse({
        timezone: 'Europe/Paris',
        conferenceStart: '2024-01-01',
        conferenceEnd: '2024-01-02',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        timezone: 'Europe/Paris',
        conferenceStart: new Date('2023-12-31T23:00:00.000Z'),
        conferenceEnd: new Date('2024-01-02T22:59:59.999Z'),
        description: null,
        location: null,
        onlineEvent: false,
        contactEmail: null,
        websiteUrl: null,
      });
    });

    it('returns errors when mandatory fields are missing', async () => {
      const result = EventDetailsSettingsSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        timezone: ['Required'],
      });
    });

    it('returns some specific errors', async () => {
      const result = EventDetailsSettingsSchema.safeParse({
        timezone: 'Europe/Paris',
        conferenceStart: '2024-01-03',
        conferenceEnd: '2024-01-02',
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        conferenceStart: ['Conference start date must be after the conference end date.'],
      });
    });
  });

  describe('#CfpConferenceOpeningSchema', () => {
    it('validates CfpConferenceOpeningSchema inputs and transform dates with TZ', async () => {
      const result = CfpConferenceOpeningSchema.safeParse({
        timezone: 'Europe/Paris',
        cfpStart: '2024-01-01',
        cfpEnd: '2024-01-02',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        timezone: 'Europe/Paris',
        cfpStart: new Date('2023-12-31T23:00:00.000Z'),
        cfpEnd: new Date('2024-01-02T22:59:59.999Z'),
      });
    });

    it('returns errors when mandatory fields are missing', async () => {
      const result = CfpConferenceOpeningSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        timezone: ['Required'],
      });
    });

    it('returns some specific errors', async () => {
      const result = CfpConferenceOpeningSchema.safeParse({
        timezone: 'Europe/Paris',
        cfpStart: '2024-01-03',
        cfpEnd: '2024-01-02',
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        cfpStart: ['Call for paper start date must be after the end date.'],
      });
    });
  });
});
