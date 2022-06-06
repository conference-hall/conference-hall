import { Response } from '@remix-run/node';

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function mapErrorToResponse(error: any) {
  if (error instanceof Response) {
    throw error;
  }
  if (error instanceof NotFoundError) {
    throw new Response(error.message, { status: 404, statusText: error.message });
  } 
  if (error instanceof BadRequestError) {
    throw new Response(error.message, { status: 400, statusText: error.message });
  } 
  throw new Response(error.message, { status: 500, statusText: error.message });
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

export class ProposalSubmissionError extends BadRequestError {
  constructor() {
    super('Error while submitting proposal');
  }
}

export class SurveyNotEnabledError extends BadRequestError {
  constructor() {
    super('Survey not enabled');
  }
}

export class InvitationFoundError extends NotFoundError {
  constructor() {
    super('Invitation not found');
  }
}

export class InvitationGenerateError extends BadRequestError {
  constructor() {
    super('Could not generate invitation key');
  }
}

export class SpeakerNotFoundError extends NotFoundError {
  constructor() {
    super('Speaker not found');
  }
}
