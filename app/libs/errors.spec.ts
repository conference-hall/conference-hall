import { Response } from '@remix-run/node';
import { getError } from '../../tests/test-helpers';

import { CfpNotOpenError, EventNotFoundError, ForbiddenOperationError, mapErrorToResponse } from './errors';

describe('#mapErrorToResponse', () => {
  it('should map NotFound error to a Response 404 error', async () => {
    const error = new EventNotFoundError();

    const err = await getError<Response>(() => mapErrorToResponse(error));
    expect(err.status).toBe(404);
    expect(err.statusText).toBe('Event not found');
  });

  it('should map BadRequest error to a Response 400 error', async () => {
    const error = new CfpNotOpenError();

    const err = await getError<Response>(() => mapErrorToResponse(error));
    expect(err.status).toBe(400);
    expect(err.statusText).toBe('CFP not open');
  });

  it('should map Forbidden error to a Response 403 error', async () => {
    const error = new ForbiddenOperationError();

    const err = await getError<Response>(() => mapErrorToResponse(error));
    expect(err.status).toBe(403);
    expect(err.statusText).toBe('Forbidden operation');
  });

  it('should throw the Response if provided as error', async () => {
    const error = new Response('Something went wrong', { status: 404 });

    const err = await getError<Response>(() => mapErrorToResponse(error));
    expect(err.status).toBe(404);
  });

  it('should throw Response 500 error for other errors', async () => {
    const error = new Error('Something went wrong');

    const err = await getError<Response>(() => mapErrorToResponse(error));
    expect(err.status).toBe(500);
    expect(err.statusText).toBe('Something went wrong');
  });
});
