import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { getNextProposalNumber } from './proposal-counter.server.ts';

describe('getNextProposalNumber', () => {
  it('assigns number 1 for first proposal in event', async () => {
    const team = await teamFactory();
    const event = await eventFactory({ team });

    const number = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(event.id, trx);
    });

    expect(number).toBe(1);
  });

  it('increments counter sequentially', async () => {
    const team = await teamFactory();
    const event = await eventFactory({ team });

    const number1 = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(event.id, trx);
    });
    const number2 = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(event.id, trx);
    });
    const number3 = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(event.id, trx);
    });

    expect(number1).toBe(1);
    expect(number2).toBe(2);
    expect(number3).toBe(3);
  });

  it('scopes numbers per event independently', async () => {
    const team = await teamFactory();
    const eventA = await eventFactory({ team });
    const eventB = await eventFactory({ team });

    const numberA1 = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(eventA.id, trx);
    });
    const numberB1 = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(eventB.id, trx);
    });
    const numberA2 = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(eventA.id, trx);
    });

    expect(numberA1).toBe(1);
    expect(numberB1).toBe(1);
    expect(numberA2).toBe(2);
  });

  it('works within transaction context', async () => {
    const team = await teamFactory();
    const event = await eventFactory({ team });

    const number = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(event.id, trx);
    });

    expect(number).toBe(1);
  });

  it('increments from pre-existing counter value', async () => {
    const team = await teamFactory();
    const event = await eventFactory({ team });

    // Initialize counter manually (simulating backfill scenario)
    await db.eventProposalCounter.create({
      data: {
        eventId: event.id,
        lastProposalNumber: 5,
      },
    });

    const number = await db.$transaction(async (trx) => {
      return await getNextProposalNumber(event.id, trx);
    });

    expect(number).toBe(6);
  });

  it('prevents duplicate numbers under concurrent creation', async () => {
    const team = await teamFactory();
    const event = await eventFactory({ team });

    // Simulate 10 concurrent proposal creations
    const promises = Array.from({ length: 10 }, () =>
      db.$transaction(async (trx) => {
        return await getNextProposalNumber(event.id, trx);
      }),
    );

    const numbers = await Promise.all(promises);
    const uniqueNumbers = new Set(numbers);

    expect(uniqueNumbers.size).toBe(10);
    expect(numbers.sort()).toEqual([1, 10, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
