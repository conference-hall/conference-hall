import { z } from 'zod';

export const PaginationSchema = z.preprocess((a) => parseInt(a as string, 10), z.number().positive().optional());

export type Pagination = z.infer<typeof PaginationSchema>;
