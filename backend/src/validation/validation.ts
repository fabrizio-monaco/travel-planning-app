import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { user } from '../database/schema/user.schema';
import { DI } from '../dependency-injection';
import { diaryEntry } from '../database/schema/diary-entry.schema';

export const selectUserZodSchema = createSelectSchema(user);
export const createUserZodSchema = createInsertSchema(user, {
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
}).transform(async (data) => {
  return {
    ...data,
    password: await DI.utils.passwordHasher.hashPassword(data.password),
  };
});
export const loginZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export const createDiaryEntryZodSchema = createInsertSchema(diaryEntry, {
  title: z.string().min(1),
  content: z.string().min(1),
})
  .pick({
    title: true,
    content: true,
  })
  .extend({
    // add optional attribute tags where we can either provide an array of tag ids or an array of tag names or a mix of them to make sure we can add existing tags or create new tags on the fly
    tags: z
      .array(
        z
          .object({
            id: z.string().uuid().optional(),
            name: z.string().min(1).optional(),
          })
          .refine((data) => data.id ?? data.name, {
            message: 'At least one of id or name must be provided',
          }),
      )
      .optional(),
  });

export const updateDiaryEntryZodSchema = createInsertSchema(diaryEntry, {
  title: z.string().min(1),
  content: z.string().min(1),
}).pick({
  title: true,
  content: true,
});

export type DbUser = z.infer<typeof selectUserZodSchema>;
export type CreateUser = z.infer<typeof createUserZodSchema>;
export type CreateDiaryEntry = z.infer<typeof createDiaryEntryZodSchema>;
export type UpdateDiaryEntry = z.infer<typeof updateDiaryEntryZodSchema>;
