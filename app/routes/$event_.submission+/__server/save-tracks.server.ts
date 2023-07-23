import { z } from 'zod';

import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';
import { repeatable } from '~/routes/__types/utils';

const TracksMandatorySchema = repeatable(z.array(z.string()).nonempty());
const TracksSchema = repeatable().optional();

const TracksUpdateSchema = z.object({ formats: TracksSchema, categories: TracksSchema });

type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;

export async function saveTracks(talkId: string, eventId: string, userId: string, data: TrackUpdateData) {
  const proposal = await db.proposal.findFirst({
    select: { id: true },
    where: { talkId, eventId, speakers: { some: { id: userId } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await db.proposal.update({
    where: { id: proposal.id },
    data: {
      formats: { set: [], connect: data.formats?.map((f) => ({ id: f })) },
      categories: {
        set: [],
        connect: data.categories?.map((c) => ({ id: c })),
      },
    },
  });
}

export function getTracksSchema(formatsRequired: boolean, categoriesRequired: boolean) {
  const FormatsSchema = formatsRequired ? TracksMandatorySchema : TracksSchema;
  const CategoriesSchema = categoriesRequired ? TracksMandatorySchema : TracksSchema;
  return z.object({ formats: FormatsSchema, categories: CategoriesSchema });
}
