import type { User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { ProfileFetcher } from '../../services/profile-fetcher.server.ts';
import { ProfileSchema } from './speaker-profile.schema.server.ts';
import { SpeakerProfile } from './speaker-profile.server.ts';

describe('SpeakerProfile', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('#save', () => {
    it('updates personal information', async () => {
      const profile = SpeakerProfile.for(user.id);

      await profile.save({
        name: 'John Doe',
        email: 'john.doe@email.com',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      const updated = await ProfileFetcher.for(user.id).get();
      expect(updated?.name).toEqual('John Doe');
      expect(updated?.email).toEqual('john.doe@email.com');
      expect(updated?.picture).toEqual('https://example.com/photo.jpg');
      expect(updated?.bio).toEqual('lorem ipsum');
      expect(updated?.references).toEqual('impedit quidem quisquam');
      expect(updated?.company).toEqual('company');
      expect(updated?.location).toEqual('location');
      expect(updated?.socialLinks).toEqual(['https://github.com/profile']);
    });
  });

  it('updates speaker profile for each event submitted', async () => {
    const event = await eventFactory();
    const talk = await talkFactory({ speakers: [user] });
    await proposalFactory({ event, talk });

    const profile = SpeakerProfile.for(user.id);

    await profile.save({
      name: 'John Doe',
      email: 'john.doe@email.com',
      picture: 'https://example.com/photo.jpg',
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
      company: 'company',
      location: 'location',
      socialLinks: ['https://github.com/profile'],
    });

    const eventSpeakers = await db.eventSpeaker.findMany({ where: { userId: user.id } });
    expect(eventSpeakers).toEqual([
      expect.objectContaining({
        eventId: event.id,
        name: 'John Doe',
        email: 'john.doe@email.com',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      }),
    ]);
  });
});

describe('Settings schemas', () => {
  describe('ProfileSchema', () => {
    it('validates user details', async () => {
      const result = ProfileSchema.safeParse({
        name: 'John Doe',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      expect(result.success && result.data).toEqual({
        name: 'John Doe',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });
    });

    it('validates mandatory and format', async () => {
      const result = ProfileSchema.safeParse({
        name: '',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      expect(result.success).toEqual(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        expect(fieldErrors.name).toEqual(['Too small: expected string to have >=1 characters']);
      }
    });
  });
});
