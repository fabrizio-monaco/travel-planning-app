import { and, eq } from 'drizzle-orm';

import { Database } from '../';
import {
  CreateDiaryEntry,
  UpdateDiaryEntry,
} from '../../validation/validation';
import { diaryEntryToTag } from '../schema/diary-entry-to-tag.schema';
import { diaryEntry } from '../schema/diary-entry.schema';

export class DiaryEntryRepository {
  constructor(private readonly database: Database) {}

  async getDiaryEntriesByUserId(userId: string, includeRelations = true) {
    return this.database.query.diaryEntry.findMany({
      where: (diaryEntry, { eq }) => eq(diaryEntry.userId, userId),
      with: includeRelations
        ? {
            diaryEntryToTags: {
              with: {
                tag: true,
              },
            },
          }
        : undefined,
    });
  }

  async getDiaryEntryOfUserById(diaryEntryId: string, userId: string) {
    return this.database.query.diaryEntry.findFirst({
      where: and(
        eq(diaryEntry.id, diaryEntryId),
        eq(diaryEntry.userId, userId),
      ),
    });
  }

  async createDiaryEntryOfUser(userId: string, data: CreateDiaryEntry) {
    // returning() by default returns an array as it follows the sql standard so we need to destructure it.
    const [entry] = await this.database
      .insert(diaryEntry)
      .values({ ...data, userId })
      .returning();
    return entry;
  }

  async updateDiaryEntryOfUser(
    diaryEntryId: string,
    userId: string,
    data: UpdateDiaryEntry,
  ) {
    const [updatedEntry] = await this.database
      .update(diaryEntry)
      .set(data)
      .where(
        and(eq(diaryEntry.id, diaryEntryId), eq(diaryEntry.userId, userId)),
      )
      .returning();
    return updatedEntry;
  }

  async deleteDiaryEntryOfUserById(diaryEntryId: string, userId: string) {
    return this.database
      .delete(diaryEntry)
      .where(
        and(eq(diaryEntry.id, diaryEntryId), eq(diaryEntry.userId, userId)),
      );
  }

  async associateTagsWithDiaryEntry(diaryEntryId: string, tagIds: string[]) {
    return this.database
      .insert(diaryEntryToTag)
      .values(tagIds.map((tagId) => ({ diaryEntryId, tagId })));
  }
}
