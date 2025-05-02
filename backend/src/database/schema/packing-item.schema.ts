import { pgTable, integer, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { commonSchema } from './common.schema';
import { trips } from './trip.schema';

export const packingItems = pgTable('packing_item', {
  ...commonSchema,
  name: varchar('name', { length: 255 }).notNull(),
  amount: integer('amount').notNull().default(1),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
});

export const packingItemsRelations = relations(packingItems, ({ one }) => ({
  trip: one(trips, {
    fields: [packingItems.tripId],
    references: [trips.id],
  }),
}));

// For TypeScript type inference
export type PackingItem = typeof packingItems.$inferSelect;
export type NewPackingItem = typeof packingItems.$inferInsert;