import { Database } from '../../src/database';
import { packingItems } from '../../src/database/schema/packing-item.schema';
import { eq } from 'drizzle-orm';

export class PackingItemTestHelper {
  constructor(private readonly database: Database) {}

  async createPackingItem(data: any) {
    const [item] = await this.database
      .insert(packingItems)
      .values(data)
      .returning();
    return item;
  }

  async deletePackingItemById(itemId: string) {
    await this.database.delete(packingItems).where(eq(packingItems.id, itemId));
  }

  async deleteAllPackingItems() {
    await this.database.delete(packingItems);
  }
}
