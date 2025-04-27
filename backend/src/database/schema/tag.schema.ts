import { relations } from 'drizzle-orm';
import { pgTable, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';
import { diaryEntryToTag } from './diary-entry-to-tag.schema';
import { user } from './user.schema';

export const tag = pgTable(
  'tags',
  {
    ...commonSchema,
    name: varchar({ length: 256 }).notNull(),
    userId: uuid()
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    unq: unique().on(table.userId, table.name),
  }),
);

export const tagRelations = relations(tag, ({ one, many }) => ({
  diaryEntryToTags: many(diaryEntryToTag),
  user: one(user, {
    fields: [tag.userId],
    references: [user.id],
  }),
}));
