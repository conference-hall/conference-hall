import type { EventType } from 'prisma/generated/enums.ts';
import type { EventCreateInput } from 'prisma/generated/models.ts';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';

export class EventCreation {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new EventCreation(authorizedTeam);
  }

  static async isSlugValid(slug: string) {
    const count = await db.event.count({ where: { slug } });
    return count === 0;
  }

  async findTemplateEvents(type: EventType) {
    const { teamId, permissions } = this.authorizedTeam;
    if (!permissions.canCreateEvent) throw new ForbiddenOperationError();

    return db.event.findMany({
      select: { id: true, name: true },
      where: { type, teamId, archived: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: z.infer<typeof EventCreateSchema>) {
    const { userId, teamId, permissions } = this.authorizedTeam;
    if (!permissions.canCreateEvent) throw new ForbiddenOperationError();

    const { eventTemplateId, ...eventData } = data;

    const eventTemplateData = await this.getEventTemplateData(eventData.type, eventTemplateId);

    return db.event.create({
      data: {
        ...eventTemplateData,
        ...eventData,
        creator: { connect: { id: userId } },
        team: { connect: { id: teamId } },
      },
    });
  }

  private async getEventTemplateData(
    type: EventType,
    eventTemplateId?: string,
  ): Promise<Partial<EventCreateInput> | null> {
    if (!eventTemplateId) return null;

    const { teamId } = this.authorizedTeam;
    const eventTemplate = await db.event.findUnique({
      include: { formats: true, categories: true, proposalTags: true, emailCustomizations: true },
      where: { id: eventTemplateId, type, teamId },
    });
    if (!eventTemplate) return null;

    return {
      description: eventTemplate.description,
      logoUrl: eventTemplate.logoUrl,
      websiteUrl: eventTemplate.websiteUrl,
      codeOfConductUrl: eventTemplate.codeOfConductUrl,
      contactEmail: eventTemplate.contactEmail,
      location: eventTemplate.location,
      onlineEvent: eventTemplate.onlineEvent,
      maxProposals: eventTemplate.maxProposals,
      displayProposalsReviews: eventTemplate.displayProposalsReviews,
      displayProposalsSpeakers: eventTemplate.displayProposalsSpeakers,
      speakersConversationEnabled: eventTemplate.speakersConversationEnabled,
      formatsRequired: eventTemplate.formatsRequired,
      formatsAllowMultiple: eventTemplate.formatsAllowMultiple,
      categoriesRequired: eventTemplate.categoriesRequired,
      categoriesAllowMultiple: eventTemplate.categoriesAllowMultiple,
      emailOrganizer: eventTemplate.emailOrganizer,
      emailNotifications: eventTemplate.emailNotifications || undefined,
      surveyConfig: eventTemplate.surveyConfig || undefined,
      formats: {
        create: eventTemplate.formats.map((item) => ({
          name: item.name,
          description: item.description,
          order: item.order,
        })),
      },
      categories: {
        create: eventTemplate.categories.map((item) => ({
          name: item.name,
          description: item.description,
          order: item.order,
        })),
      },
      proposalTags: {
        create: eventTemplate.proposalTags.map((item) => ({
          name: item.name,
          color: item.color,
        })),
      },
      emailCustomizations: {
        create: eventTemplate.emailCustomizations.map((item) => ({
          template: item.template,
          locale: item.locale,
          subject: item.subject,
          content: item.content,
        })),
      },
    };
  }
}

export const EventCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  type: z.enum(['CONFERENCE', 'MEETUP']),
  timezone: z.string(),
  slug: SlugSchema.refine(EventCreation.isSlugValid, { error: 'This URL already exists.' }),
  eventTemplateId: z.string().optional(),
});
