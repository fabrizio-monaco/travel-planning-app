import { eq } from 'drizzle-orm';
import { Database } from '../';
import { destinations } from '../schema/destination.schema';

export class DestinationRepository {
  constructor(private readonly database: Database) {}

  async getAllDestinations(withRelations: boolean = false) {
    if (withRelations) {
      return this.database.query.destinations.findMany({
        with: {
          tripToDestinations: {
            with: {
              trip: true,
            },
          },
        },
      });
    } else {
      return this.database.query.destinations.findMany();
    }
  }

  async getDestinationById(
    destinationId: string,
    withRelations: boolean = false,
  ) {
    if (withRelations) {
      return this.database.query.destinations.findFirst({
        where: eq(destinations.id, destinationId),
        with: {
          tripToDestinations: {
            with: {
              trip: true,
            },
          },
        },
      });
    } else {
      return this.database.query.destinations.findFirst({
        where: eq(destinations.id, destinationId),
      });
    }
  }

  async createDestination(data: any) {
    // Process activities and photos if provided
    if (typeof data.activities === 'string') {
      try {
        data.activities = JSON.stringify(JSON.parse(data.activities));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(data.activities)) {
      data.activities = JSON.stringify(data.activities);
    }

    if (typeof data.photos === 'string') {
      try {
        data.photos = JSON.stringify(JSON.parse(data.photos));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(data.photos)) {
      data.photos = JSON.stringify(data.photos);
    }

    const [destination] = await this.database
      .insert(destinations)
      .values(data)
      .returning();
    return destination;
  }

  async updateDestination(destinationId: string, data: any) {
    // Process activities and photos if provided
    if (typeof data.activities === 'string') {
      try {
        data.activities = JSON.stringify(JSON.parse(data.activities));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(data.activities)) {
      data.activities = JSON.stringify(data.activities);
    }

    if (typeof data.photos === 'string') {
      try {
        data.photos = JSON.stringify(JSON.parse(data.photos));
      } catch (e) {
        // If not valid JSON, store as is
      }
    } else if (Array.isArray(data.photos)) {
      data.photos = JSON.stringify(data.photos);
    }

    const [updatedDestination] = await this.database
      .update(destinations)
      .set(data)
      .where(eq(destinations.id, destinationId))
      .returning();
    return updatedDestination;
  }

  async deleteDestination(destinationId: string) {
    return this.database
      .delete(destinations)
      .where(eq(destinations.id, destinationId));
  }
}
