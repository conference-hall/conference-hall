import { Response } from '@remix-run/node';
import type { ErrorResult } from 'domain-functions';

class NotFoundError extends Error {}

class ForbiddenError extends Error {}

class BadRequestError extends Error {}

export function fromErrors(result: ErrorResult) {
  const { message, exception } = result.errors[0] || {};

  if (exception instanceof NotFoundError) {
    throw new Response(message, {
      status: 404,
      statusText: message,
    });
  }
  if (exception instanceof BadRequestError) {
    throw new Response(message, {
      status: 400,
      statusText: message,
    });
  }
  if (exception instanceof ForbiddenError) {
    throw new Response(message, {
      status: 403,
      statusText: message,
    });
  }
  if (exception instanceof Error) {
    throw new Response(message, { status: 500, statusText: message });
  }
}

export function mapErrorToResponse(error: unknown) {
  if (error instanceof Response) {
    throw error;
  }
  if (error instanceof NotFoundError) {
    throw new Response(error.message, {
      status: 404,
      statusText: error.message,
    });
  }
  if (error instanceof BadRequestError) {
    throw new Response(error.message, {
      status: 400,
      statusText: error.message,
    });
  }
  if (error instanceof ForbiddenError) {
    throw new Response(error.message, {
      status: 403,
      statusText: error.message,
    });
  }
  if (error instanceof Error) {
    throw new Response(error.message, { status: 500, statusText: error.message });
  }
}

export class EventNotFoundError extends NotFoundError {
  constructor() {
    super('Event not found');
  }
}

export class ProposalNotFoundError extends NotFoundError {
  constructor() {
    super('Proposal not found');
  }
}

export class CfpNotOpenError extends BadRequestError {
  constructor() {
    super('CFP not open');
  }
}

export class TalkNotFoundError extends NotFoundError {
  constructor() {
    super('Talk not found');
  }
}

export class MaxSubmittedProposalsReachedError extends BadRequestError {
  constructor() {
    super('You have reached the maximum number of proposals.');
  }
}

export class SurveyNotEnabledError extends BadRequestError {
  constructor() {
    super('Survey not enabled');
  }
}

export class InvitationNotFoundError extends NotFoundError {
  constructor() {
    super('Invitation not found');
  }
}

export class InvitationGenerateError extends BadRequestError {
  constructor() {
    super('Could not generate invitation key');
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('User not found');
  }
}

export class SpeakerNotFoundError extends NotFoundError {
  constructor() {
    super('Speaker not found');
  }
}

export class OrganizationNotFoundError extends NotFoundError {
  constructor() {
    super('Organization not found');
  }
}

export class ForbiddenOperationError extends ForbiddenError {
  constructor() {
    super('Forbidden operation');
  }
}

export class ApiKeyInvalidError extends BadRequestError {
  constructor() {
    super('API key invalid');
  }
}
