import { and, eq, or, like, gte, lte, isNull } from 'drizzle-orm';
import { Database } from '../';
import { trips } from '../schema/trip.schema';
import { tripToDestinations } from '../schema/trip-to-destination.schema';
import { CreateTrip, UpdateTrip } from '../../validation/validation';
import { formatDateForDb } from '../../utils/date-utils';

export class TripRepository {
  constructor(private readonly database: Database) {}

  async getAllTrips(withRelations: boolean = false) {
    if (withRelations) {
      return this.database.query.trips.findMany({
        with: {
          tripToDestinations: {
            with: {
              destination: true,
            },
          },
          packingItems: true,
        },
      });
    } else {
      return this.database.query.trips.findMany();
    }
  }

  async getTripById(tripId: string, withRelations: boolean = false) {
    if (withRelations) {
      return this.database.query.trips.findFirst({
        where: eq(trips.id, tripId),
        with: {
          tripToDestinations: {
            with: {
              destination: true,
            },
          },
          packingItems: true,
        },
      });
    } else {
      return this.database.query.trips.findFirst({
        where: eq(trips.id, tripId),
      });
    }
  }

  async createTrip(data: any) {
    // Parse participants if provided as a string
    if (typeof data.participants === 'string') {
      try {
        data.participants = JSON.stringify(JSON.parse(data.participants));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(data.participants)) {
      data.participants = JSON.stringify(data.participants);
    }

    const [trip] = await this.database.insert(trips).values(data).returning();
    return trip;
  }

  async updateTrip(tripId: string, data: any) {
    // Parse participants if provided as a string
    if (typeof data.participants === 'string') {
      try {
        data.participants = JSON.stringify(JSON.parse(data.participants));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(data.participants)) {
      data.participants = JSON.stringify(data.participants);
    }

    const [updatedTrip] = await this.database
      .update(trips)
      .set(data)
      .where(eq(trips.id, tripId))
      .returning();
    return updatedTrip;
  }

  async deleteTrip(tripId: string) {
    return this.database.delete(trips).where(eq(trips.id, tripId));
  }

  async searchTrips(
    query: string,
    startDate?: Date,
    endDate?: Date,
    withRelations: boolean = false,
  ) {
    const conditions = [];

    // Search by name if query is provided
    if (query) {
      conditions.push(like(trips.name, `%${query}%`));
    }

    // Format dates for database comparison using the utility function
    const startDateStr = formatDateForDb(startDate);
    const endDateStr = formatDateForDb(endDate);

    // Search by date range if dates are provided
    if (startDateStr && endDateStr) {
      // Find trips that are entirely within the provided date range
      conditions.push(
        and(gte(trips.startDate, startDateStr), lte(trips.endDate, endDateStr)),
      );
    } else if (startDateStr) {
      // Only start date provided - find trips that start on or after this date
      conditions.push(gte(trips.startDate, startDateStr));
    } else if (endDateStr) {
      // Only end date provided - find trips that end on or before this date
      conditions.push(lte(trips.endDate, endDateStr));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    if (withRelations) {
      return this.database.query.trips.findMany({
        where: whereCondition,
        with: {
          tripToDestinations: {
            with: {
              destination: true,
            },
          },
          packingItems: true,
        },
      });
    } else {
      return this.database.query.trips.findMany({
        where: whereCondition,
      });
    }
  }

  async getTripsByDestination(
    destinationId: string,
    withRelations: boolean = false,
  ) {
    if (withRelations) {
      return this.database.query.trips
        .findMany({
          with: {
            tripToDestinations: {
              where: eq(tripToDestinations.destinationId, destinationId),
              with: {
                destination: true,
              },
            },
            packingItems: true,
          },
        })
        .then((trips) =>
          trips.filter((trip) => trip.tripToDestinations.length > 0),
        );
    } else {
      // We still need the relation to filter by destinationId, but we don't need to include the full destination
      return this.database.query.trips
        .findMany({
          with: {
            tripToDestinations: {
              where: eq(tripToDestinations.destinationId, destinationId),
            },
          },
        })
        .then((trips) => {
          // Filter to only include trips associated with this destination
          const filteredTrips = trips.filter(
            (trip) => trip.tripToDestinations.length > 0,
          );

          // Remove the tripToDestinations property from each trip
          return filteredTrips.map(({ tripToDestinations, ...trip }) => trip);
        });
    }
  }
}
