import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DI } from '../dependency-injection';
import { trips } from '../database/schema/trip.schema';
import { destinations } from '../database/schema/destination.schema';
import { tripToDestinations } from '../database/schema/trip-to-destination.schema';
import { packingItems } from '../database/schema/packing-item.schema';

// Trip validation schemas
const baseTripSchema = createInsertSchema(trips, {
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  image: z.string().optional(),
  participants: z
    .union([
      z.string(), // JSON string format
      z.array(z.string()), // Array of participant names
    ])
    .optional(),
});

export const createTripZodSchema = baseTripSchema.refine(
  (data) => {
    // Validate that endDate is after startDate if both are provided
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  },
);

// Create partial schema from the base schema (before refine is applied)
export const updateTripZodSchema = baseTripSchema.partial().refine(
  (data) => {
    // Validate that endDate is after startDate if both are provided
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  },
);

// Destination validation schemas
const baseDestinationSchema = createInsertSchema(destinations, {
  name: z.string().min(1),
  description: z.string().optional(),
  activities: z
    .union([
      z.string(), // JSON string format
      z.array(z.string()), // Array of activity names
    ])
    .optional(),
  photos: z
    .union([
      z.string(), // JSON string format
      z.array(z.string()), // Array of photo URLs
    ])
    .optional(),
});

export const createDestinationZodSchema = baseDestinationSchema;
export const updateDestinationZodSchema = baseDestinationSchema.partial();

// Trip-to-Destination relationship validation schema
export const tripToDestinationZodSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      // Validate that endDate is after startDate if both are provided
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    },
  );

// Trip search validation schema
export const tripSearchZodSchema = z.object({
  query: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Packing Item validation schemas
const basePackingItemSchema = createInsertSchema(packingItems, {
  name: z.string().min(1),
  amount: z.number().int().positive().default(1),
  tripId: z.string().uuid(),
});

export const createPackingItemZodSchema = basePackingItemSchema;
export const updatePackingItemZodSchema = basePackingItemSchema.partial();

// Export types for usage in controllers
export type CreateTrip = z.infer<typeof createTripZodSchema>;
export type UpdateTrip = z.infer<typeof updateTripZodSchema>;
export type CreateDestination = z.infer<typeof createDestinationZodSchema>;
export type UpdateDestination = z.infer<typeof updateDestinationZodSchema>;
export type TripToDestinationData = z.infer<typeof tripToDestinationZodSchema>;
export type TripSearchParams = z.infer<typeof tripSearchZodSchema>;
export type CreatePackingItem = z.infer<typeof createPackingItemZodSchema>;
export type UpdatePackingItem = z.infer<typeof updatePackingItemZodSchema>;
