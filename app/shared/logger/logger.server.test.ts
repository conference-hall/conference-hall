import { describe, expect, it, vi } from 'vitest';
import { logger } from './logger.server.ts';

describe('logger', () => {
  it('logs error messages (LOG_LEVEL=error in test env)', () => {
    logger.error('Something happened');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Something happened'));
  });

  it('logs error messages with serialized error nested under error key', () => {
    const cause = new Error('root cause');
    const error = new Error('something broke', { cause });

    logger.error('Operation failed', { error });

    const output = vi.mocked(console.error).mock.calls[0][0] as string;
    expect(output).toContain('Operation failed');
    expect(output).toContain('error=');
    expect(output).toContain('something broke');
    expect(output).toContain('root cause');
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
