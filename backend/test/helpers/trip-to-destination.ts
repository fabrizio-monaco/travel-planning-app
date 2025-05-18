import { Database } from '../../src/database';
import { tripToDestinations } from '../../src/database/schema/trip-to-destination.schema';
import { and, eq } from 'drizzle-orm';
import { formatDateForDb } from '../../src/utils/date-utils';

export class TripToDestinationTestHelper {
  constructor(private readonly database: Database) {}
  async addDestinationToTrip(
    tripId: string,
    destinationId: string,
    data: any = {},
  ) {
    // Format dates for database storage
    let startDateStr;
    let endDateStr;

    // Convert strings to Date objects if they exist, or use undefined
    if (data.startDate) {
      startDateStr =
        typeof data.startDate === 'string'
          ? data.startDate
          : formatDateForDb(data.startDate);
    }

    if (data.endDate) {
      endDateStr =
        typeof data.endDate === 'string'
          ? data.endDate
          : formatDateForDb(data.endDate);
    }

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

  async deleteRelation(tripId: string, destinationId: string) {
    await this.database
      .delete(tripToDestinations)
      .where(
        and(
          eq(tripToDestinations.tripId, tripId),
          eq(tripToDestinations.destinationId, destinationId),
        ),
      );
  }

  async deleteAllRelations() {
    await this.database.delete(tripToDestinations);
  }
}
