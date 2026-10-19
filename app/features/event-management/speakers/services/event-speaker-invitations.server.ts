import { randomUUID } from 'node:crypto';
import { EventSpeakerForProposal } from '~/features/event-participation/speaker-proposals/services/event-speaker-for-proposal.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import SpeakerInvitationEmail from '~/shared/emails/templates/speakers/event-invitation.email.tsx';
import {
  ForbiddenOperationError,
  InvitationInvalidOrAccepted,
  SpeakerEmailAlreadyExistsError,
  SpeakerInvitationAlreadyExistsError,
  SpeakerInvitationDeliveryError,
  UserNotFoundError,
} from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { type SpeakerInvitationData, SpeakerInvitationSchema } from '~/shared/types/speaker-invitation.types.ts';
import { type DbTransaction, db } from '../../../../../prisma/db.server.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';
import { getSharedServerEnv } from '../../../../../servers/environment.server.ts';

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const emailInclude = {
  user: { select: { locale: true } },
  event: { select: { name: true, team: { select: { name: true } } } },
  invitedBy: { select: { name: true } },
} satisfies Prisma.EventSpeakerInvitationInclude;

type InvitationEmailData = Prisma.EventSpeakerInvitationGetPayload<{ include: typeof emailInclude }>;

export class EventSpeakerInvitations {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventSpeakerInvitations(authorizedEvent);
  }

  async list(page = 1) {
    this.#checkPermission();
    const where = { eventId: this.authorizedEvent.event.id };
    const total = await db.eventSpeakerInvitation.count({ where });
    const pagination = new Pagination({ page, total });
    const invitations = await db.eventSpeakerInvitation.findMany({
      where,
      select: { id: true, email: true, message: true, status: true, expiresAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      invitations: invitations.map((invitation) => ({
        ...invitation,
        status:
          invitation.status === 'PENDING' && invitation.expiresAt <= new Date()
            ? ('EXPIRED' as const)
            : invitation.status,
      })),
      pagination: { current: pagination.page, total: pagination.pageCount },
      total,
    };
  }

  async invite(data: SpeakerInvitationData) {
    this.#checkPermission();
    const { email, message } = SpeakerInvitationSchema.parse(data);
    const { event, userId: invitedById } = this.authorizedEvent;

    const invitation = await EventSpeakerInvitations.#transaction(async (trx) => {
      const users = await trx.user.findMany({
        where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
        select: { id: true, email: true },
        take: 2,
      });
      if (users.length !== 1) throw new UserNotFoundError();
      const user = users[0];

      const speaker = await trx.eventSpeaker.findFirst({
        where: {
          eventId: event.id,
          OR: [{ userId: user.id }, { email: { equals: user.email, mode: 'insensitive' } }],
        },
      });
      if (speaker) throw new SpeakerEmailAlreadyExistsError();

      const where = { eventId_userId: { eventId: event.id, userId: user.id } };
      const existing = await trx.eventSpeakerInvitation.findUnique({ where });
      if (
        existing &&
        !(existing.status === 'CANCELED' || (existing.status === 'PENDING' && existing.expiresAt <= new Date()))
      ) {
        throw new SpeakerInvitationAlreadyExistsError();
      }

      const values = {
        email: user.email,
        message: message || null,
        invitedById,
        status: 'PENDING' as const,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + INVITATION_LIFETIME_MS),
      };
      return trx.eventSpeakerInvitation.upsert({
        where,
        create: { ...values, eventId: event.id, userId: user.id },
        update: values,
        include: emailInclude,
      });
    });

    await this.#deliver(invitation);
  }

  async resend(invitationId: string) {
    this.#checkPermission();
    const { event, userId: invitedById } = this.authorizedEvent;
    const invitation = await EventSpeakerInvitations.#transaction(async (trx) => {
      const existing = await trx.eventSpeakerInvitation.findFirst({
        where: { id: invitationId, eventId: event.id, status: 'PENDING', user: { deletedAt: null } },
        include: { user: { select: { email: true } } },
      });
      if (!existing) throw new InvitationInvalidOrAccepted();

      return trx.eventSpeakerInvitation.update({
        where: { id: existing.id },
        data: {
          email: existing.user.email,
          invitedById,
          token: randomUUID(),
          expiresAt: new Date(Date.now() + INVITATION_LIFETIME_MS),
        },
        include: emailInclude,
      });
    });

    await this.#deliver(invitation);
  }

  async cancel(invitationId: string) {
    this.#checkPermission();
    const result = await db.eventSpeakerInvitation.updateMany({
      where: { id: invitationId, eventId: this.authorizedEvent.event.id, status: 'PENDING' },
      data: { status: 'CANCELED', token: null },
    });
    if (result.count !== 1) throw new InvitationInvalidOrAccepted();
  }

  static async getForRecipient(token: string, userId: string) {
    return db.eventSpeakerInvitation.findFirst({
      where: { token, userId, status: 'PENDING', expiresAt: { gt: new Date() }, user: { deletedAt: null } },
      select: {
        message: true,
        event: { select: { name: true, team: { select: { name: true } } } },
        invitedBy: { select: { name: true } },
      },
    });
  }

  static async respond(token: string, userId: string, response: 'accept' | 'decline') {
    return EventSpeakerInvitations.#transaction(async (trx) => {
      const where = {
        token,
        userId,
        status: 'PENDING' as const,
        expiresAt: { gt: new Date() },
        user: { deletedAt: null },
      };
      const invitation = await trx.eventSpeakerInvitation.findFirst({
        where,
        include: { user: true, event: { select: { slug: true } } },
      });
      if (!invitation) throw new InvitationInvalidOrAccepted();

      const consumed = await trx.eventSpeakerInvitation.updateMany({
        where: { ...where, id: invitation.id },
        data: { status: response === 'accept' ? 'ACCEPTED' : 'DECLINED', token: null },
      });
      if (consumed.count !== 1) throw new InvitationInvalidOrAccepted();

      if (response === 'accept') {
        const existingSpeaker = await trx.eventSpeaker.findFirst({
          where: { eventId: invitation.eventId, userId },
        });

        if (!existingSpeaker) {
          const emailConflict = await trx.eventSpeaker.findFirst({
            where: { eventId: invitation.eventId, email: { equals: invitation.user.email, mode: 'insensitive' } },
          });
          if (emailConflict) throw new SpeakerEmailAlreadyExistsError();
          await EventSpeakerForProposal.for(invitation.eventId, trx).upsertForUser(invitation.user);
        }
      }

      return { eventSlug: invitation.event.slug };
    });
  }

  #checkPermission() {
    if (!this.authorizedEvent.permissions.canCreateEventSpeaker) throw new ForbiddenOperationError();
  }

  async #deliver(invitation: InvitationEmailData) {
    const { APP_URL } = getSharedServerEnv();
    try {
      await sendEmail.trigger(
        SpeakerInvitationEmail.buildPayload(invitation.email, invitation.user.locale, {
          eventName: invitation.event.name,
          teamName: invitation.event.team.name,
          organizerName: invitation.invitedBy?.name || invitation.event.team.name,
          message: invitation.message,
          invitationUrl: new URL(`/invite/event/${invitation.token}`, APP_URL).toString(),
        }),
      );
    } catch {
      // A failed enqueue must allow retrying without leaving a usable, unsent invitation.
      await db.eventSpeakerInvitation.updateMany({
        where: { id: invitation.id, token: invitation.token, status: 'PENDING' },
        data: { status: 'CANCELED', token: null },
      });
      throw new SpeakerInvitationDeliveryError();
    }
  }

  static async #transaction<T>(action: (trx: DbTransaction) => Promise<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await db.$transaction(action, { isolationLevel: 'Serializable' });
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          !['P2034', 'P2002'].includes(error.code) ||
          attempt >= 3
        ) {
          throw error;
        }
      }
    }
  }
}
