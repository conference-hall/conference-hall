import type { Job } from 'bullmq';

import { emailProvider } from '~/libs/emails/provider';

import type { Email } from './email.payload';

export const processor = (job: Job<Email>) => emailProvider.send(job.data);
