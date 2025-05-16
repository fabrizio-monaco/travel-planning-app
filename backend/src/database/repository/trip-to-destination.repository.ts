import { and, eq } from 'drizzle-orm';
import { Database } from '../';
import { tripToDestinations } from '../schema/trip-to-destination.schema';
import { TripToDestinationData } from '../../validation/validation';
import { formatDateForDb } from '../../utils/date-utils';

export class TripToDestinationRepository {
  constructor(private readonly database: Database) {}

  async addDestinationToTrip(
    tripId: string,
    destinationId: string,
    data: TripToDestinationData = {},
  ) {
    // Format dates for database storage using the utility function
    const startDateStr = formatDateForDb(data.startDate) || undefined;
    const endDateStr = formatDateForDb(data.endDate) || undefined;

    const [relation] = await this.database
      .insert(tripToDestinations)
      .values({
        tripId,
        destinationId,
        startDate: startDateStr,
        endDate: endDateStr,
      })
      .returning();
    return relation;
  }

  async updateTripDestination(
    tripId: string,
    destinationId: string,
    data: TripToDestinationData = {},
  ) {
    // Format dates for database storage using the utility function
    const startDateStr = formatDateForDb(data.startDate) || undefined;
    const endDateStr = formatDateForDb(data.endDate) || undefined;

    const [updatedRelation] = await this.database
      .update(tripToDestinations)
      .set({
        startDate: startDateStr,
        endDate: endDateStr,
      })
      .where(
        and(
          eq(tripToDestinations.tripId, tripId),
          eq(tripToDestinations.destinationId, destinationId),
        ),
      )
      .returning();
    return updatedRelation;
  }

  async removeDestinationFromTrip(tripId: string, destinationId: string) {
    return this.database
      .delete(tripToDestinations)
      .where(
        and(
          eq(tripToDestinations.tripId, tripId),
          eq(tripToDestinations.destinationId, destinationId),
        ),
      );
  }

  async getTripsForDestination(destinationId: string) {
    return this.database.query.tripToDestinations.findMany({
      where: eq(tripToDestinations.destinationId, destinationId),
      with: {
        trip: true,
      },
    });
  }

  async getDestinationsForTrip(tripId: string) {
    return this.database.query.tripToDestinations.findMany({
      where: eq(tripToDestinations.tripId, tripId),
      with: {
        destination: true,
      },
    });
  }
}
