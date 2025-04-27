import type { Database } from '../';
import { tag } from '../schema/tag.schema';

export class TagRepository {
  constructor(private readonly database: Database) {}

  async getTagsByUserId(userId: string) {
    return this.database.query.tag.findMany({
      where: (tag, { eq }) => eq(tag.userId, userId),
    });
  }

  async createTagsForUser(userId: string, data: string[]) {
    return this.database
      .insert(tag)
      .values(data.map((name) => ({ name, userId })))
      .onConflictDoNothing()
      .returning();
  }

  async getTagsByNamesOrIds(names: string[], ids: string[], userId: string) {
    return this.database.query.tag.findMany({
      where: (tag, { and, or, eq, inArray }) =>
        and(
          or(inArray(tag.id, ids), inArray(tag.name, names)),
          eq(tag.userId, userId),
        ),
    });
  }
}
