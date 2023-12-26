import type { Job } from 'bullmq';
import { emailProvider } from 'jobs/libs/emails/provider';

import type { Email } from './email.payload';

export const processor = (job: Job<Email>) => {
  if (!emailProvider) return Promise.reject('Email provider not found');

  return emailProvider.send(job.data);
};
