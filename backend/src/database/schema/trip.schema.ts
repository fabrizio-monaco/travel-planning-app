import { pgTable, varchar, text, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { commonSchema } from './common.schema';
import { tripToDestinations } from './trip-to-destination.schema';
import { packingItems } from './packing-item.schema';

export const trips = pgTable('trip', {
  ...commonSchema,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  image: text('image'), // URL or path to the trip image
  participants: text('participants'), // JSON stringified array
});

export const tripsRelations = relations(trips, ({ many }) => ({
  tripToDestinations: many(tripToDestinations),
  packingItems: many(packingItems),
}));

// For TypeScript type inference
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
