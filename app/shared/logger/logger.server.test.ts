import { describe, expect, it, vi } from 'vitest';
import { logger } from './logger.server.ts';

describe('logger', () => {
  it('logs error messages (LOG_LEVEL=error in test env)', () => {
    logger.error('Something happened');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Something happened'));
  });

  it('logs error objects separately from pretty message', () => {
    const spy = vi.spyOn(console, 'error');
    const error = new Error('Boom');

    logger.error('Something happened', { error });

    expect(spy).toHaveBeenCalledTimes(2);

    const [firstCallArgs, secondCallArgs] = spy.mock.calls;

    const [firstArg] = firstCallArgs ?? [];
    expect(typeof firstArg).toBe('string');
    expect(firstArg).toEqual(expect.stringContaining('Something happened'));

    const [secondArg] = secondCallArgs ?? [];
    expect(secondArg).toBe(error);
  });

  it('does not log info messages when LOG_LEVEL=warn', () => {
    logger.info('Should be filtered');

    expect(console.info).not.toHaveBeenCalled();
  });

  it('does not log debug messages when LOG_LEVEL=warn', () => {
    const spy = vi.spyOn(console, 'debug');
    logger.debug('Should be filtered');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
