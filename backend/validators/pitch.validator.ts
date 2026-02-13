import { z } from 'zod';

export const createPitchSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  website: z.string()
    .url('Invalid website URL')
    .max(255, 'Website must be at most 255 characters'),
  founder: z.string()
    .min(1, 'Founder wallet address is required')
    .max(100, 'Founder address too long'),
});

export const verifyPitchSchema = z.object({
  txid: z.string()
    .min(10, 'Invalid transaction ID')
    .max(100, 'Invalid transaction ID'),
});

export const updatePitchSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .max(255, 'Website must be at most 255 characters')
    .optional(),
}).strict();

export type CreatePitchInput = z.infer<typeof createPitchSchema>;
export type VerifyPitchInput = z.infer<typeof verifyPitchSchema>;
export type UpdatePitchInput = z.infer<typeof updatePitchSchema>;
