import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { diaryEntry } from './diary-entry.schema';
import { tag } from './tag.schema';

export const diaryEntryToTag = pgTable(
  'diary_entries_to_tags',
  {
    diaryEntryId: uuid()
      .notNull()
      .references(() => diaryEntry.id),
    tagId: uuid()
      .notNull()
      .references(() => tag.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.diaryEntryId, t.tagId] }),
  }),
);

export const diaryEntryToTagRelations = relations(
  diaryEntryToTag,
  ({ one }) => ({
    diaryEntry: one(diaryEntry, {
      fields: [diaryEntryToTag.diaryEntryId],
      references: [diaryEntry.id],
    }),
    tag: one(tag, {
      fields: [diaryEntryToTag.tagId],
      references: [tag.id],
    }),
  }),
);
