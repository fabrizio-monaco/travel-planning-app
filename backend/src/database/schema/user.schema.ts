import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';
import { diaryEntry } from './diary-entry.schema';
import { tag } from './tag.schema';

export const user = pgTable('users', {
  ...commonSchema,
  email: varchar({ length: 256 }).notNull(),
  password: varchar({ length: 256 }).notNull(),
  firstName: varchar({ length: 256 }).notNull(),
  lastName: varchar({ length: 256 }).notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  diaryEntries: many(diaryEntry),
  tags: many(tag),
}));
