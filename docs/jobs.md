# Jobs

Conference Hall uses **BullMQ** with Redis for background job processing. The system provides a custom abstraction layer for type-safe job creation and management.

## Architecture

- **Queue System**: BullMQ with Redis backend
- **Worker Process**: Separate process (`servers/jobs.ts`) handling job execution
- **Job Definition**: Custom `job()` function with TypeScript generics
- **Error Handling**: Automatic retries with exponential backoff
- **Logging**: Structured logging with job lifecycle events

## Creating Jobs

### Job Configuration Options

```ts
import { job } from '~/shared/jobs/job.ts';

interface MyJobPayload {
  userId: string;
}

export const myJob = job<MyJobPayload>({
  name: 'unique-job-name', // Required: Job identifier
  queue: 'default', // Optional: Queue name
  run: async (payload) => {
    // Required: Job execution function
    // Implementation
    console.log('Processing job for user:', payload.userId);
  },
});
```

**Default Settings:**

- **Retry attempts**: 5
- **Backoff strategy**: Exponential with 3000ms delay
- **Concurrency**: 1 per worker
- **Job retention**: 1000 completed and failed jobs

## Triggering Jobs

### Basic Usage

```ts
// Trigger job execution
await myJob.trigger({
  userId: 'user-123',
});
```

## Testing Jobs

### Unit Testing

Test job logic directly by calling the `run` function:

```ts
import { myJob } from './my-job.ts';

test('processes job successfully', async () => {
  const payload = { userId: 'user-123', data: {} };

  // Call job logic directly
  await myJob.config.run(payload);

  // Assert expected behavior
  expect(/* your assertions */);
});
```

### Integration Testing

Jobs are automatically mocked in the test environment.

```ts
import { sendEmail } from '~/shared/emails/send-email.job.ts';

test('sends email job', async () => {
  await sendEmail.trigger({
    template: 'test-template',
    to: ['test@example.com'],
    // ... other properties
  });

  // Verify job was triggered
  expect(sendEmail.trigger).toHaveBeenCalledWith({
    template: 'test-template',
    to: ['test@example.com'],
    // ... expected payload
  });
});
```

## Best Practices

1. **Type Safety**: Always define payload interfaces for jobs
2. **Error Handling**: Let jobs throw errors for automatic retries
3. **Idempotency**: Design jobs to be safely retryable
4. **Logging**: Use structured logging for job events
5. **Testing**: Test job logic separately from queue mechanics
6. **Payload Size**: Keep job payloads small; store large data in database

## Environment Configuration

Required environment variables:

- `REDIS_URL` - Redis connection string
- `DATABASE_URL` - PostgreSQL connection

## Monitoring

Jobs are logged with structured data including:

- Job name and queue
- Execution time
- Success/failure status
- Error details for failed jobs

Worker events are logged:

- `ready` - Worker started with available jobs
- `completed` - Job finished successfully
- `failed` - Job failed with error details
