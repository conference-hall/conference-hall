import { ActionFunction, json } from '@remix-run/node';
import { requireUserSession } from '../../../features/auth/auth.server';
import { db } from '../../../services/db';

export type InvitationLink = {
  link?: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const talkId = params.id;

  const talk = await db.talk.findFirst({
    select: { id: true, invitation: true },
    where: {
      speakers: { some: { id: uid } },
      id: talkId,
    },
  });

  if (!talk) {
    return json<InvitationLink>({
      link: undefined,
    });
  }

  if (talk.invitation) {
    return json<InvitationLink>({
      link: `http://localhost:3000/invitation/${talk.invitation.id}`,
    });
  }

  const invite = await db.invite.create({
    data: {
      type: 'SPEAKER',
      entityId: talk.id, // TODO Can be deleted from invite table?
      talk: { connect: { id: talkId } },
      invitedBy: { connect: { id: uid } },
    },
  });

  return json<InvitationLink>({
    link: `http://localhost:3000/invitation/${invite.id}`,
  });
};
