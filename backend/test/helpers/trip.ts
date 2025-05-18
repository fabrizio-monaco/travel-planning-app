import { Database } from '../../src/database';
import { trips } from '../../src/database/schema/trip.schema';
import { eq } from 'drizzle-orm';

export class TripTestHelper {
  constructor(private readonly database: Database) {}

  async createTrip(data: any) {
    // Parse participants if needed
    let formattedData = { ...data };

    if (typeof formattedData.participants === 'string') {
      try {
        formattedData.participants = JSON.stringify(
          JSON.parse(formattedData.participants),
        );
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(formattedData.participants)) {
      formattedData.participants = JSON.stringify(formattedData.participants);
    }

    const [trip] = await this.database
      .insert(trips)
      .values(formattedData)
      .returning();
    return trip;
  }
  async deleteTripById(tripId: string) {
    await this.database.delete(trips).where(eq(trips.id, tripId));
  }

  async deleteAllTrips() {
    await this.database.delete(trips);
  }
}
