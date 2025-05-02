import { pgTable, uuid, primaryKey, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';
import { trips } from './trip.schema';
import { destinations } from './destination.schema';

export const tripToDestinations = pgTable(
  'trip_to_destination',
  {
    // Instead of spreading commonSchema, define the timestamp fields directly
    // but omit the id field with primaryKey
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    startDate: date('start_date'),
    endDate: date('end_date'),
  },
  (table) => [primaryKey({ columns: [table.tripId, table.destinationId] })],
);

export const tripToDestinationsRelations = relations(
  tripToDestinations,
  ({ one }) => ({
    trip: one(trips, {
      fields: [tripToDestinations.tripId],
      references: [trips.id],
    }),
    destination: one(destinations, {
      fields: [tripToDestinations.destinationId],
      references: [destinations.id],
    }),
  }),
);

// For TypeScript type inference
export type TripToDestination = typeof tripToDestinations.$inferSelect;
export type NewTripToDestination = typeof tripToDestinations.$inferInsert;
