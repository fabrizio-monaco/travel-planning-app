import { and, eq } from 'drizzle-orm';
import { Database } from '../';
import { tripToDestinations } from '../schema/trip-to-destination.schema';
import { TripToDestinationData } from '../../validation/validation';

export class TripToDestinationRepository {
  constructor(private readonly database: Database) {}

  async addDestinationToTrip(
    tripId: string,
    destinationId: string,
    data: TripToDestinationData = {},
  ) {
    // Convert Date objects to ISO strings for database storage
    const startDateStr = data.startDate
      ? data.startDate.toISOString().split('T')[0]
      : undefined;
    const endDateStr = data.endDate
      ? data.endDate.toISOString().split('T')[0]
      : undefined;

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
    // Convert Date objects to ISO strings for database storage
    const startDateStr = data.startDate
      ? data.startDate.toISOString().split('T')[0]
      : undefined;
    const endDateStr = data.endDate
      ? data.endDate.toISOString().split('T')[0]
      : undefined;

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
