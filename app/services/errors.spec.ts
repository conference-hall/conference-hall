import { CfpNotOpenError, EventNotFoundError, mapErrorToResponse } from './errors';

describe('#mapErrorToResponse', () => {
  it('should map NotFound error to a Response 404 error', () => {
    const error = new EventNotFoundError();
    try {
      mapErrorToResponse(error);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.status).toBe(404);
      expect(err.statusText).toBe('Event not found');
    }
  });

  it('should map BadRequest error to a Response 400 error', () => {
    const error = new CfpNotOpenError();
    try {
      mapErrorToResponse(error);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.status).toBe(400);
      expect(err.statusText).toBe('CFP not open');
    }
  });

  it('should throw the Response if provided as error', () => {
    const error = new Response('Something went wrong', { status: 404 });
    try {
      mapErrorToResponse(error);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.status).toBe(404);
    }
  })

  it('should throw Response 500 error for other errors', () => {
    const error = new Error('Something went wrong');
    try {
      mapErrorToResponse(error);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.status).toBe(500);
      expect(err.statusText).toBe('Something went wrong');
    }
  })
});