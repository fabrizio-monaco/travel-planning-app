import { pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { commonSchema } from './common.schema';
import { tripToDestinations } from './trip-to-destination.schema';

export const destinations = pgTable('destination', {
  ...commonSchema,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  activities: text('activities'), // Store as JSON stringified array
  photos: text('photos'), // Store as JSON stringified array
});

export const destinationsRelations = relations(destinations, ({ many }) => ({
  tripToDestinations: many(tripToDestinations),
}));

// For TypeScript type inference
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
