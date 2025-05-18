import { TestDatabase } from '../helpers/database';
import { TripRepository } from '../../src/database/repository/trip.repository';
import { TripTestHelper } from '../helpers/trip';
import { DestinationTestHelper } from '../helpers/destination';
import { TripToDestinationTestHelper } from '../helpers/trip-to-destination';
import { PackingItemTestHelper } from '../helpers/packing-item';
import { eq } from 'drizzle-orm';
import { packingItems } from '../../src/database/schema/packing-item.schema';

/**
 * Integration tests for the TripRepository class.
 * These tests verify the repository's interaction with the database.
 */
// Increase the timeout for database operations
jest.setTimeout(30000);

const TEST_IDS = {
  TRIP_1: '123e4567-e89b-12d3-a456-426614174000',
  TRIP_2: '123e4567-e89b-12d3-a456-426614174001',
  DESTINATION_1: '123e4567-e89b-12d3-a456-426614174002',
  DESTINATION_2: '123e4567-e89b-12d3-a456-426614174003',
  PACKING_ITEM_1: '123e4567-e89b-12d3-a456-426614174004',
  NON_EXISTENT_TRIP: '123e4567-e89b-12d3-a456-999999999999',
} as const;

describe('TripRepository Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let repository: TripRepository;
  let tripHelper: TripTestHelper;
  let destinationHelper: DestinationTestHelper;
  let tripToDestinationHelper: TripToDestinationTestHelper;
  let packingItemHelper: PackingItemTestHelper;

  beforeAll(async () => {
    await testDatabase.setup();
    repository = new TripRepository(testDatabase.database);
    tripHelper = new TripTestHelper(testDatabase.database);
    destinationHelper = new DestinationTestHelper(testDatabase.database);
    tripToDestinationHelper = new TripToDestinationTestHelper(
      testDatabase.database,
    );
    packingItemHelper = new PackingItemTestHelper(testDatabase.database);
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  beforeEach(async () => {
    // Clean up before each test
    await packingItemHelper.deleteAllPackingItems();
    await tripToDestinationHelper.deleteAllRelations();
    await tripHelper.deleteAllTrips();
    await destinationHelper.deleteAllDestinations();
  });

  describe('getAllTrips', () => {
    it('should return empty array when no trips exist', async () => {
      // Act
      const trips = await repository.getAllTrips();

      // Assert
      expect(trips).toEqual([]);
    });

    it('should return all trips without relations', async () => {
      // Arrange
      const trip1 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Summer Vacation',
        description: 'A summer trip',
        startDate: '2023-06-01',
        endDate: '2023-06-10',
      });

      const trip2 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_2,
        name: 'Winter Holidays',
        description: 'A winter trip',
        startDate: '2023-12-20',
        endDate: '2023-12-31',
      });

      // Act
      const trips = await repository.getAllTrips();

      // Assert
      expect(trips).toHaveLength(2);
      expect(trips[0].id).toBe(trip1.id);
      expect(trips[1].id).toBe(trip2.id);
    });

    it('should return all trips with relations when withRelations is true', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Summer Trip',
        description: 'Summer description',
        startDate: '2023-06-01',
        endDate: '2023-06-10',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Beach Resort',
        description: 'Beautiful beach',
      });

      await tripToDestinationHelper.addDestinationToTrip(
        trip.id,
        destination.id,
        { startDate: '2023-06-02', endDate: '2023-06-05' },
      );

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Sunscreen',
        amount: 1,
        tripId: trip.id,
      }); // Act
      const trips = await repository.getAllTrips(true);

      // Assert
      expect(trips).toHaveLength(1);
      expect(trips[0].id).toBe(trip.id);
      // Using type assertion to handle the dynamically loaded relations
      const tripsWithRelations = trips as any[];
      expect(tripsWithRelations[0].tripToDestinations).toHaveLength(1);
      expect(tripsWithRelations[0].tripToDestinations[0].destination.id).toBe(
        destination.id,
      );
      expect(tripsWithRelations[0].packingItems).toHaveLength(1);
      expect(tripsWithRelations[0].packingItems[0].name).toBe('Sunscreen');
    });
  });

  describe('getTripById', () => {
    it('should return undefined for non-existent trip', async () => {
      // Act
      const result = await repository.getTripById(TEST_IDS.NON_EXISTENT_TRIP);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return trip without relations', async () => {
      // Arrange
      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Summer Vacation',
        description: 'A summer trip',
        startDate: '2023-06-01',
        endDate: '2023-06-10',
      });

      // Act
      const trip = await repository.getTripById(TEST_IDS.TRIP_1);

      // Assert
      expect(trip).toBeDefined();
      expect(trip?.id).toBe(TEST_IDS.TRIP_1);
      expect(trip?.name).toBe('Summer Vacation');
    });

    it('should return trip with relations when withRelations is true', async () => {
      // Arrange
      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Summer Trip',
        description: 'Summer description',
        startDate: '2023-06-01',
        endDate: '2023-06-10',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Beach Resort',
        description: 'Beautiful beach',
      });

      await tripToDestinationHelper.addDestinationToTrip(
        TEST_IDS.TRIP_1,
        destination.id,
        { startDate: '2023-06-02', endDate: '2023-06-05' },
      );

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Sunscreen',
        amount: 1,
        tripId: TEST_IDS.TRIP_1,
      }); // Act
      const trip = await repository.getTripById(TEST_IDS.TRIP_1, true);

      // Assert
      expect(trip).toBeDefined();
      expect(trip?.id).toBe(TEST_IDS.TRIP_1);
      // Using type assertion to handle the dynamically loaded relations
      const tripWithRelations = trip as any;
      expect(tripWithRelations.tripToDestinations).toHaveLength(1);
      expect(tripWithRelations.tripToDestinations[0].destination.id).toBe(
        destination.id,
      );
      expect(tripWithRelations.packingItems).toHaveLength(1);
      expect(tripWithRelations.packingItems[0].name).toBe('Sunscreen');
    });
  });

  describe('createTrip', () => {
    it('should create a trip with valid data', async () => {
      // Arrange
      const tripData = {
        name: 'New Trip',
        description: 'Trip description',
        startDate: '2023-07-01',
        endDate: '2023-07-15',
        participants: ['John', 'Jane'],
      };

      // Act
      const trip = await repository.createTrip(tripData);

      // Assert      expect(trip).toBeDefined();
      expect(trip.id).toBeDefined();
      expect(trip.name).toBe(tripData.name);
      expect(trip.description).toBe(tripData.description);
      // Compare participants - handle both string and array formats
      const parsedParticipants =
        typeof trip.participants === 'string'
          ? JSON.parse(trip.participants)
          : trip.participants;

      // Make sure expectedParticipants is an array regardless of input format
      const expectedParticipants =
        typeof tripData.participants === 'string'
          ? JSON.parse(tripData.participants)
          : tripData.participants;

      // Now we can safely iterate over the array
      for (const participant of expectedParticipants) {
        expect(parsedParticipants).toContain(participant);
      }
      expect(parsedParticipants.length).toBe(expectedParticipants.length);

      // Verify the trip was saved to the database
      const savedTrip = await repository.getTripById(trip.id);
      expect(savedTrip).toBeDefined();
      expect(savedTrip?.name).toBe(tripData.name);
    });

    it('should handle participants as a JSON string', async () => {
      // Arrange
      const tripData = {
        name: 'New Trip',
        description: 'Trip description',
        startDate: '2023-07-01',
        endDate: '2023-07-15',
        participants: JSON.stringify(['John', 'Jane']),
      };

      // Act
      const trip = await repository.createTrip(tripData);

      // Assert
      expect(trip).toBeDefined();
      expect(trip.participants).toBe(JSON.stringify(['John', 'Jane']));
    });
  });

  describe('updateTrip', () => {
    it('should update a trip with valid data', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Original Trip',
        description: 'Original description',
        startDate: '2023-08-01',
        endDate: '2023-08-10',
      });

      const updateData = {
        name: 'Updated Trip',
        description: 'Updated description',
        participants: ['Alice', 'Bob'],
      };

      // Act
      const updatedTrip = await repository.updateTrip(trip.id, updateData);

      // Assert      expect(updatedTrip).toBeDefined();
      expect(updatedTrip.id).toBe(trip.id);
      expect(updatedTrip.name).toBe(updateData.name);
      expect(updatedTrip.description).toBe(updateData.description);
      // Compare participants - handle both string and array formats
      const parsedParticipants =
        typeof updatedTrip.participants === 'string'
          ? JSON.parse(updatedTrip.participants)
          : updatedTrip.participants;

      // Make sure expectedParticipants is an array regardless of input format
      const expectedParticipants =
        typeof updateData.participants === 'string'
          ? JSON.parse(updateData.participants)
          : updateData.participants;

      // Now we can safely iterate over the array
      for (const participant of expectedParticipants) {
        expect(parsedParticipants).toContain(participant);
      }
      expect(parsedParticipants.length).toBe(expectedParticipants.length);

      // Verify the changes were saved to the database
      const savedTrip = await repository.getTripById(trip.id);
      expect(savedTrip?.name).toBe(updateData.name);
    });

    it('should update only the provided fields', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Original Trip',
        description: 'Original description',
        startDate: '2023-08-01',
        endDate: '2023-08-10',
      });

      const updateData = {
        name: 'Updated Trip Name',
      };

      // Act
      const updatedTrip = await repository.updateTrip(trip.id, updateData);

      // Assert
      expect(updatedTrip).toBeDefined();
      expect(updatedTrip.name).toBe(updateData.name);
      expect(updatedTrip.description).toBe(trip.description); // Should remain unchanged
    });
  });

  describe('deleteTrip', () => {
    it('should delete an existing trip', async () => {
      // Arrange
      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip to Delete',
        description: 'Will be deleted',
      });

      // Verify the trip exists before deletion
      const tripBeforeDelete = await repository.getTripById(TEST_IDS.TRIP_1);
      expect(tripBeforeDelete).toBeDefined();

      // Act
      await repository.deleteTrip(TEST_IDS.TRIP_1);

      // Assert
      const tripAfterDelete = await repository.getTripById(TEST_IDS.TRIP_1);
      expect(tripAfterDelete).toBeUndefined();
    });

    it('should not throw error when deleting non-existent trip', async () => {
      // Act & Assert
      await expect(
        repository.deleteTrip(TEST_IDS.NON_EXISTENT_TRIP),
      ).resolves.not.toThrow();
    });

    it('should delete trip and its related packing items (due to cascade)', async () => {
      // Arrange
      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip with Items',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Toothbrush',
        tripId: TEST_IDS.TRIP_1,
      });

      // Verify item exists before deletion
      const items = await testDatabase.database.query.packingItems.findMany({
        where: (packingItems) => eq(packingItems.tripId, TEST_IDS.TRIP_1),
      });
      expect(items.length).toBe(1);

      // Act
      await repository.deleteTrip(TEST_IDS.TRIP_1);

      // Assert - item should be deleted due to cascade constraint
      const itemsAfterDelete =
        await testDatabase.database.query.packingItems.findMany({
          where: (packingItems) => eq(packingItems.tripId, TEST_IDS.TRIP_1),
        });
      expect(itemsAfterDelete.length).toBe(0);
    });
  });

  describe('searchTrips', () => {
    beforeEach(async () => {
      // Create test data for search tests
      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Beach Vacation',
        description: 'Relaxing at the beach',
        startDate: '2023-06-15',
        endDate: '2023-06-25',
      });

      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_2,
        name: 'Mountain Adventure',
        description: 'Hiking in the mountains',
        startDate: '2023-07-10',
        endDate: '2023-07-20',
      });
    });

    it('should search trips by name', async () => {
      // Act
      const results = await repository.searchTrips('Beach');

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Beach Vacation');
    });

    it('should search trips by date range', async () => {
      // Act
      const results = await repository.searchTrips(
        '', // No name query
        new Date('2023-06-10'), // Start date
        new Date('2023-07-01'), // End date
      );

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Beach Vacation');
    });

    it('should search trips by start date only', async () => {
      // Act
      const results = await repository.searchTrips(
        '', // No name query
        new Date('2023-07-01'), // Start date after the beach trip
        undefined, // No end date
      );

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Mountain Adventure');
    });

    it('should search trips by end date only', async () => {
      // Act
      const results = await repository.searchTrips(
        '', // No name query
        undefined, // No start date
        new Date('2023-06-30'), // End date before the mountain trip
      );

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Beach Vacation');
    });

    it('should return empty array when no trips match search criteria', async () => {
      // Act
      const results = await repository.searchTrips('Non-existent trip');

      // Assert
      expect(results).toHaveLength(0);
    });

    it('should return trips with relations when withRelations is true', async () => {
      // Arrange
      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Tropical Beach',
      });

      await tripToDestinationHelper.addDestinationToTrip(
        TEST_IDS.TRIP_1,
        destination.id,
      ); // Act
      const results = await repository.searchTrips(
        'Beach',
        undefined,
        undefined,
        true,
      );

      // Assert
      expect(results).toHaveLength(1);
      // Using type assertion to handle the dynamically loaded relations
      const resultsWithRelations = results as any[];
      expect(resultsWithRelations[0].tripToDestinations).toHaveLength(1);
      expect(
        resultsWithRelations[0].tripToDestinations[0].destination.name,
      ).toBe('Tropical Beach');
    });
  });

  describe('getTripsByDestination', () => {
    beforeEach(async () => {
      // Create test trips and destinations for this test suite
      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Tour',
      });

      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_2,
        name: 'Asia Trip',
      });

      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
      });

      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_2,
        name: 'Tokyo',
      });

      // Europe Tour includes Paris
      await tripToDestinationHelper.addDestinationToTrip(
        TEST_IDS.TRIP_1,
        TEST_IDS.DESTINATION_1,
      );

      // Asia Trip includes Tokyo
      await tripToDestinationHelper.addDestinationToTrip(
        TEST_IDS.TRIP_2,
        TEST_IDS.DESTINATION_2,
      );
    });

    it('should return trips for a specific destination', async () => {
      // Act
      const parisTrips = await repository.getTripsByDestination(
        TEST_IDS.DESTINATION_1,
      );

      // Assert
      expect(parisTrips).toHaveLength(1);
      expect(parisTrips[0].name).toBe('Europe Tour');
    });

    it('should return empty array for destination with no trips', async () => {
      // Act
      const nonExistentDestinationTrips =
        await repository.getTripsByDestination(TEST_IDS.NON_EXISTENT_TRIP);

      // Assert
      expect(nonExistentDestinationTrips).toHaveLength(0);
    });

    it('should return trips with relations when withRelations is true', async () => {
      // Act
      const parisTrips = await repository.getTripsByDestination(
        TEST_IDS.DESTINATION_1,
        true,
      );

      // Assert
      expect(parisTrips).toHaveLength(1);
      // Using type assertion to handle the dynamically loaded relations
      const parisTripsWithRelations = parisTrips as any[];
      expect(parisTripsWithRelations[0].tripToDestinations).toHaveLength(1);
      expect(
        parisTripsWithRelations[0].tripToDestinations[0].destination.name,
      ).toBe('Paris');
    });
  });
});
