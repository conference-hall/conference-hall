import type { Event, EventCategory, EventFormat, Proposal, Team, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

import { updateProposal, updateProposalsStatus } from './update-proposal.server';

describe('#updateProposal', () => {
  let owner: User, reviewer: User, speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;
  let proposal: Proposal;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
  });
  afterEach(async () => {
    await disconnectDB();
  });

  it('updates the proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const updated = await updateProposal(event.slug, proposal.id, owner.id, {
      title: 'Updated',
      abstract: 'Updated',
      level: 'ADVANCED',
      references: 'Updated',
      languages: [],
      formats: [format.id],
      categories: [category.id],
    });

    expect(updated.title).toBe('Updated');
    expect(updated.abstract).toBe('Updated');
    expect(updated.level).toBe('ADVANCED');
    expect(updated.references).toBe('Updated');

    const formatCount = await db.eventFormat.count({ where: { proposals: { some: { id: proposal.id } } } });
    expect(formatCount).toBe(1);

    const categoryCount = await db.eventCategory.count({ where: { proposals: { some: { id: proposal.id } } } });
    expect(categoryCount).toBe(1);
  });

  it('throws an error if user has not a owner or member role in the team', async () => {
    await expect(
      updateProposal(event.slug, proposal.id, reviewer.id, {
        title: 'Updated',
        abstract: 'Updated',
        level: null,
        references: null,
        languages: [],
      }),
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      updateProposal(event.slug, proposal.id, user.id, {
        title: 'Updated',
        abstract: 'Updated',
        level: null,
        references: null,
        languages: [],
      }),
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#updateProposalsStatus', () => {
  let owner: User, reviewer: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });
  afterEach(async () => {
    await disconnectDB();
  });

  it('updates the proposal', async () => {
    const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const updatedCount = await updateProposalsStatus(event.slug, owner.id, [proposal1.id, proposal2.id], 'ACCEPTED');

    expect(updatedCount).toBe(2);
    const proposals = await db.proposal.findMany();
    expect(proposals[0].status).toBe('ACCEPTED');
    expect(proposals[1].status).toBe('ACCEPTED');
  });

  it('throws an error if user has not a owner or member role in the team', async () => {
    await expect(updateProposalsStatus(event.slug, reviewer.id, [], 'ACCEPTED')).rejects.toThrowError(
      ForbiddenOperationError,
    );
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(updateProposalsStatus(event.slug, user.id, [proposal.id], 'ACCEPTED')).rejects.toThrowError(
      ForbiddenOperationError,
    );
  });
});
