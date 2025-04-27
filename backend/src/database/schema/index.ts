// !Import all database schemas - import * as xyz from is necessary
import * as diaryEntryToTag from './diary-entry-to-tag.schema';
import * as diaryEntry from './diary-entry.schema';
import * as tag from './tag.schema';
import * as user from './user.schema';

export const databaseSchema = {
  ...diaryEntry,
  ...tag,
  ...user,
  ...diaryEntryToTag,
};
