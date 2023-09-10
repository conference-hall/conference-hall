import type { Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

import { createEvent } from './create-event.server';

describe('#createEvent', () => {
  let owner: User, reviewer: User;
  let team: Team;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
  });

  it('creates a new event into the team', async () => {
    const created = await createEvent(team.slug, owner.id, {
      type: 'CONFERENCE',
      name: 'Hello world',
      slug: 'hello-world',
      visibility: 'PUBLIC',
    });

    expect(created.slug).toBe('hello-world');

    const event = await db.event.findUnique({ where: { slug: created.slug } });
    expect(event?.type).toBe('CONFERENCE');
    expect(event?.name).toBe('Hello world');
    expect(event?.slug).toBe('hello-world');
    expect(event?.visibility).toBe('PUBLIC');
    expect(event?.teamId).toBe(team.id);
    expect(event?.creatorId).toBe(owner.id);
  });

  it('returns an error message when slug already exists', async () => {
    await eventFactory({ team, attributes: { slug: 'hello-world' } });

    const created = await createEvent(team.slug, owner.id, {
      type: 'CONFERENCE',
      name: 'Hello world',
      slug: 'hello-world',
      visibility: 'PUBLIC',
    });

    expect(created?.error?.fieldErrors?.slug).toEqual('This URL already exists, please try another one.');
  });

  it('throws an error if user is not owner', async () => {
    await expect(
      createEvent(team.slug, reviewer.id, {
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
      }),
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    await expect(
      createEvent(team.slug, user.id, {
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
      }),
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
