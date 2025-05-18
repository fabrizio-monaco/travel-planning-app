import { Database } from '../../src/database';
import { destinations } from '../../src/database/schema/destination.schema';
import { eq } from 'drizzle-orm';

export class DestinationTestHelper {
  constructor(private readonly database: Database) {}

  async createDestination(data: any) {
    // Process activities and photos if needed
    let formattedData = { ...data };

    if (typeof formattedData.activities === 'string') {
      try {
        formattedData.activities = JSON.stringify(
          JSON.parse(formattedData.activities),
        );
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(formattedData.activities)) {
      formattedData.activities = JSON.stringify(formattedData.activities);
    }

    if (typeof formattedData.photos === 'string') {
      try {
        formattedData.photos = JSON.stringify(JSON.parse(formattedData.photos));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(formattedData.photos)) {
      formattedData.photos = JSON.stringify(formattedData.photos);
    }

    const [destination] = await this.database
      .insert(destinations)
      .values(formattedData)
      .returning();

    return destination;
  }

  async deleteDestinationById(id: string) {
    await this.database.delete(destinations).where(eq(destinations.id, id));
  }

  async deleteAllDestinations() {
    await this.database.delete(destinations);
  }
}
