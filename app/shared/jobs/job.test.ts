const { registerJobSchedulers } = await vi.importActual<typeof import('./job.ts')>('./job.ts');

const { upsertJobScheduler, add } = vi.hoisted(() => ({ upsertJobScheduler: vi.fn(), add: vi.fn() }));

vi.mock('bullmq', () => ({
  Queue: class FakeQueue {
    upsertJobScheduler = upsertJobScheduler;
    add = add;
  },
}));

function fakeJob(config: object) {
  return { config: { run: async () => {}, ...config }, trigger: async () => {} } as any;
}

describe('registerJobSchedulers', () => {
  beforeEach(() => {
    upsertJobScheduler.mockClear();
  });

  it('registers a BullMQ Job Scheduler for jobs that declare a repeat config', async () => {
    await registerJobSchedulers([
      fakeJob({ name: 'conversation-digest', queue: 'default', repeat: { pattern: '0 8 * * *', tz: 'UTC' } }),
    ]);

    expect(upsertJobScheduler).toHaveBeenCalledTimes(1);
    expect(upsertJobScheduler).toHaveBeenCalledWith(
      'conversation-digest',
      { pattern: '0 8 * * *', tz: 'UTC' },
      { name: 'conversation-digest' },
    );
  });

  it('uses a stable scheduler id so repeated startups do not duplicate schedulers', async () => {
    const job = fakeJob({ name: 'conversation-digest', queue: 'default', repeat: { pattern: '0 8 * * *', tz: 'UTC' } });

    await registerJobSchedulers([job]);
    await registerJobSchedulers([job]);

    expect(upsertJobScheduler.mock.calls.every((call) => call[0] === 'conversation-digest')).toBe(true);
  });

  it('ignores one-shot jobs without a repeat config', async () => {
    await registerJobSchedulers([fakeJob({ name: 'send-email', queue: 'default' })]);

    expect(upsertJobScheduler).not.toHaveBeenCalled();
  });
});
