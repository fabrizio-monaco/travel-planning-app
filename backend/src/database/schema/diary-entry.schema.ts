import { relations } from 'drizzle-orm';
import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';
import { diaryEntryToTag } from './diary-entry-to-tag.schema';
import { user } from './user.schema';

export const diaryEntry = pgTable('diary_entries', {
  ...commonSchema,
  title: varchar({ length: 256 }).notNull(),
  content: text().notNull(),
  userId: uuid()
    .notNull()
    .references(() => user.id),
});

export const diaryEntryRelations = relations(diaryEntry, ({ one, many }) => ({
  user: one(user, {
    fields: [diaryEntry.userId],
    references: [user.id],
  }),
  diaryEntryToTags: many(diaryEntryToTag),
}));
