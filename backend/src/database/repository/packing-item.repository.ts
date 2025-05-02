import { and, eq } from 'drizzle-orm';
import { Database } from '../';
import { packingItems } from '../schema/packing-item.schema';

export class PackingItemRepository {
  constructor(private readonly database: Database) {}

  async getAllPackingItems(withRelations: boolean = false) {
    if (withRelations) {
      return this.database.query.packingItems.findMany({
        with: {
          trip: true,
        },
      });
    } else {
      return this.database.query.packingItems.findMany();
    }
  }

  async getPackingItemById(itemId: string, withRelations: boolean = false) {
    if (withRelations) {
      return this.database.query.packingItems.findFirst({
        where: eq(packingItems.id, itemId),
        with: {
          trip: true,
        },
      });
    } else {
      return this.database.query.packingItems.findFirst({
        where: eq(packingItems.id, itemId),
      });
    }
  }

  async getPackingItemsByTripId(
    tripId: string,
    withRelations: boolean = false,
  ) {
    if (withRelations) {
      return this.database.query.packingItems.findMany({
        where: eq(packingItems.tripId, tripId),
        with: {
          trip: true,
        },
      });
    } else {
      return this.database.query.packingItems.findMany({
        where: eq(packingItems.tripId, tripId),
      });
    }
  }

  async createPackingItem(data: any) {
    const [item] = await this.database
      .insert(packingItems)
      .values(data)
      .returning();
    return item;
  }

  async updatePackingItem(itemId: string, data: any) {
    const [updatedItem] = await this.database
      .update(packingItems)
      .set(data)
      .where(eq(packingItems.id, itemId))
      .returning();
    return updatedItem;
  }

  async deletePackingItem(itemId: string) {
    return this.database
      .delete(packingItems)
      .where(eq(packingItems.id, itemId));
  }

  async deletePackingItemsByTripId(tripId: string) {
    return this.database
      .delete(packingItems)
      .where(eq(packingItems.tripId, tripId));
  }
}
