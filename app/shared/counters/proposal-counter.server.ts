import type { DbTransaction } from 'prisma/db.server.ts';

export async function getNextProposalNumber(eventId: string, trx: DbTransaction): Promise<number | null> {
  try {
    // Atomic increment using INSERT ... ON CONFLICT DO UPDATE
    // This ensures only one transaction can increment the counter at a time
    const result = await trx.$queryRaw<Array<{ lastProposalNumber: number }>>`
        INSERT INTO event_proposal_counters ("eventId", "lastProposalNumber")
        VALUES (${eventId}, 1)
        ON CONFLICT ("eventId")
        DO UPDATE SET "lastProposalNumber" = event_proposal_counters."lastProposalNumber" + 1
        RETURNING "lastProposalNumber"
      `;

    if (!result || result.length === 0 || result[0]?.lastProposalNumber === undefined) {
      throw new Error(`Proposal counter query succeeded but returned no data for event ${eventId}`);
    }
    return result[0].lastProposalNumber;
  } catch (error) {
    throw new Error(`Failed to assign proposal number for event ${eventId}. Please try again.`, { cause: error });
  }
}
