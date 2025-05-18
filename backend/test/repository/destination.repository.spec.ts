import { TestDatabase } from '../helpers/database';
import { DestinationRepository } from '../../src/database/repository/destination.repository';
import { DestinationTestHelper } from '../helpers/destination';
import { TripTestHelper } from '../helpers/trip';
import { TripToDestinationTestHelper } from '../helpers/trip-to-destination';
import { eq } from 'drizzle-orm';

/**
 * Integration tests for the DestinationRepository class.
 * These tests verify the repository's interaction with the database.
 */
const TEST_IDS = {
  DESTINATION_1: '123e4567-e89b-12d3-a456-426614174010',
  DESTINATION_2: '123e4567-e89b-12d3-a456-426614174011',
  TRIP_1: '123e4567-e89b-12d3-a456-426614174012',
  NON_EXISTENT_DESTINATION: '123e4567-e89b-12d3-a456-999999999999',
} as const;

describe('DestinationRepository Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let repository: DestinationRepository;
  let destinationHelper: DestinationTestHelper;
  let tripHelper: TripTestHelper;
  let tripToDestinationHelper: TripToDestinationTestHelper;

  // Increase timeout for database setup
  jest.setTimeout(30000);

  beforeAll(async () => {
    await testDatabase.setup();
    repository = new DestinationRepository(testDatabase.database);
    destinationHelper = new DestinationTestHelper(testDatabase.database);
    tripHelper = new TripTestHelper(testDatabase.database);
    tripToDestinationHelper = new TripToDestinationTestHelper(
      testDatabase.database,
    );
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  beforeEach(async () => {
    // Clean up before each test
    await tripToDestinationHelper.deleteAllRelations();
    await destinationHelper.deleteAllDestinations();
    await tripHelper.deleteAllTrips();
  });

  describe('getAllDestinations', () => {
    it('should return empty array when no destinations exist', async () => {
      // Act
      const destinations = await repository.getAllDestinations();

      // Assert
      expect(destinations).toEqual([]);
    });

    it('should return all destinations without relations', async () => {
      // Arrange
      const destination1 = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
        description: 'City of Lights',
      });

      const destination2 = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_2,
        name: 'Rome',
        description: 'Eternal City',
      });

      // Act
      const destinations = await repository.getAllDestinations();

      // Assert
      expect(destinations).toHaveLength(2);
      expect(destinations[0].id).toBe(destination1.id);
      expect(destinations[1].id).toBe(destination2.id);
    });

    it('should return all destinations with relations when withRelations is true', async () => {
      // Arrange
      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
        description: 'City of Lights',
      });

      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Tour',
        description: 'Tour of European cities',
      });

      await tripToDestinationHelper.addDestinationToTrip(
        trip.id,
        TEST_IDS.DESTINATION_1,
        { startDate: '2023-06-01', endDate: '2023-06-05' },
      ); // Act
      const destinations = await repository.getAllDestinations(true);

      // Assert
      expect(destinations).toHaveLength(1);
      expect(destinations[0].id).toBe(TEST_IDS.DESTINATION_1);
      // Using type assertion to handle the dynamically loaded relations
      const destinationsWithRelations = destinations as any[];
      expect(destinationsWithRelations[0].tripToDestinations).toHaveLength(1);
      expect(destinationsWithRelations[0].tripToDestinations[0].trip.id).toBe(
        trip.id,
      );
    });
  });

  describe('getDestinationById', () => {
    it('should return undefined for non-existent destination', async () => {
      // Act
      const result = await repository.getDestinationById(
        TEST_IDS.NON_EXISTENT_DESTINATION,
      );

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return destination without relations', async () => {
      // Arrange
      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
        description: 'City of Lights',
        activities: ['Eiffel Tower', 'Louvre Museum'],
        photos: ['paris1.jpg', 'paris2.jpg'],
        latitude: 48.8566,
        longitude: 2.3522,
      });

      // Act
      const destination = await repository.getDestinationById(
        TEST_IDS.DESTINATION_1,
      );

      // Assert
      expect(destination).toBeDefined();
      expect(destination?.id).toBe(TEST_IDS.DESTINATION_1);
      expect(destination?.name).toBe('Paris');
      expect(destination?.latitude).toBe(48.8566);
      expect(destination?.longitude).toBe(2.3522);
      expect(JSON.parse(destination?.activities as string)).toEqual([
        'Eiffel Tower',
        'Louvre Museum',
      ]);
      expect(JSON.parse(destination?.photos as string)).toEqual([
        'paris1.jpg',
        'paris2.jpg',
      ]);
    });

    it('should return destination with relations when withRelations is true', async () => {
      // Arrange
      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
        description: 'City of Lights',
      });

      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Tour',
      });

      await tripToDestinationHelper.addDestinationToTrip(
        trip.id,
        TEST_IDS.DESTINATION_1,
      ); // Act
      const destination = await repository.getDestinationById(
        TEST_IDS.DESTINATION_1,
        true,
      );

      // Assert
      expect(destination).toBeDefined();
      expect(destination?.id).toBe(TEST_IDS.DESTINATION_1);
      // Using type assertion to handle the dynamically loaded relations
      const destinationWithRelations = destination as any;
      expect(destinationWithRelations.tripToDestinations).toHaveLength(1);
      expect(destinationWithRelations.tripToDestinations[0].trip.id).toBe(
        trip.id,
      );
    });
  });

  describe('createDestination', () => {
    it('should create a destination with valid data', async () => {
      // Arrange
      const destinationData = {
        name: 'New York',
        description: 'The Big Apple',
        activities: ['Central Park', 'Empire State Building', 'Times Square'],
        photos: ['nyc1.jpg', 'nyc2.jpg'],
        latitude: 40.7128,
        longitude: -74.006,
      };

      // Act
      const destination = await repository.createDestination(destinationData);

      // Assert
      expect(destination).toBeDefined();
      expect(destination.id).toBeDefined();
      expect(destination.name).toBe(destinationData.name);
      expect(destination.description).toBe(destinationData.description);
      expect(destination.latitude).toBe(destinationData.latitude);
      expect(destination.longitude).toBe(destinationData.longitude); // Parse the activities from the destination
      const parsedActivities = JSON.parse(destination.activities as string);
      expect(Array.isArray(parsedActivities)).toBe(true);

      // Handle activities comparison whether it's an array or a string
      const expectedActivities = destinationData.activities;
      if (Array.isArray(expectedActivities)) {
        expectedActivities.forEach((activity) => {
          expect(parsedActivities).toContain(activity);
        });
        expect(parsedActivities.length).toBe(expectedActivities.length);
      } else if (typeof expectedActivities === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsedExpected = JSON.parse(expectedActivities);
          if (Array.isArray(parsedExpected)) {
            parsedExpected.forEach((activity) => {
              expect(parsedActivities).toContain(activity);
            });
            expect(parsedActivities.length).toBe(parsedExpected.length);
          }
        } catch (e) {
          // If not a valid JSON string, simply check if it's in the array
          expect(parsedActivities).toContain(expectedActivities);
        }
      }
      const parsedPhotos = JSON.parse(destination.photos as string);
      expect(Array.isArray(parsedPhotos)).toBe(true);

      // Handle photos comparison whether it's an array or a string
      const expectedPhotos = destinationData.photos;
      if (Array.isArray(expectedPhotos)) {
        expectedPhotos.forEach((photo) => {
          expect(parsedPhotos).toContain(photo);
        });
        expect(parsedPhotos.length).toBe(expectedPhotos.length);
      } else if (typeof expectedPhotos === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsedExpected = JSON.parse(expectedPhotos);
          if (Array.isArray(parsedExpected)) {
            parsedExpected.forEach((photo) => {
              expect(parsedPhotos).toContain(photo);
            });
            expect(parsedPhotos.length).toBe(parsedExpected.length);
          }
        } catch (e) {
          // If not a valid JSON string, simply check if it's in the array
          expect(parsedPhotos).toContain(expectedPhotos);
        }
      }

      // Verify the destination was saved to the database
      const savedDestination = await repository.getDestinationById(
        destination.id,
      );
      expect(savedDestination).toBeDefined();
      expect(savedDestination?.name).toBe(destinationData.name);
    });

    it('should handle activities and photos as JSON strings', async () => {
      // Arrange
      const destinationData = {
        name: 'London',
        description: 'Capital of UK',
        activities: JSON.stringify(['Big Ben', 'London Eye']),
        photos: JSON.stringify(['london1.jpg', 'london2.jpg']),
      };

      // Act
      const destination = await repository.createDestination(destinationData);

      // Assert
      expect(destination).toBeDefined();
      expect(JSON.parse(destination.activities as string)).toEqual([
        'Big Ben',
        'London Eye',
      ]);
      expect(JSON.parse(destination.photos as string)).toEqual([
        'london1.jpg',
        'london2.jpg',
      ]);
    });
  });

  describe('updateDestination', () => {
    it('should update a destination with valid data', async () => {
      // Arrange
      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Original Name',
        description: 'Original description',
        activities: ['Original activity'],
        latitude: 0,
        longitude: 0,
      });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        activities: ['New activity 1', 'New activity 2'],
        latitude: 12.3456,
        longitude: 78.9012,
      };

      // Act
      const updatedDestination = await repository.updateDestination(
        destination.id,
        updateData,
      );

      // Assert
      expect(updatedDestination).toBeDefined();
      expect(updatedDestination.id).toBe(destination.id);
      expect(updatedDestination.name).toBe(updateData.name);
      expect(updatedDestination.description).toBe(updateData.description);
      expect(updatedDestination.latitude).toBe(updateData.latitude);
      expect(updatedDestination.longitude).toBe(updateData.longitude); // Extract and parse activities array properly
      const parsedActivities = JSON.parse(
        updatedDestination.activities as string,
      );
      expect(Array.isArray(parsedActivities)).toBe(true);

      // Handle activities comparison whether it's an array or a string
      const expectedActivities = updateData.activities;
      if (Array.isArray(expectedActivities)) {
        expectedActivities.forEach((activity) => {
          expect(parsedActivities).toContain(activity);
        });
        expect(parsedActivities.length).toBe(expectedActivities.length);
      } else if (typeof expectedActivities === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsedExpected = JSON.parse(expectedActivities);
          if (Array.isArray(parsedExpected)) {
            parsedExpected.forEach((activity) => {
              expect(parsedActivities).toContain(activity);
            });
            expect(parsedActivities.length).toBe(parsedExpected.length);
          }
        } catch (e) {
          // If not a valid JSON string, simply check if it's in the array
          expect(parsedActivities).toContain(expectedActivities);
        }
      }

      // Verify the changes were saved to the database
      const savedDestination = await repository.getDestinationById(
        destination.id,
      );
      expect(savedDestination?.name).toBe(updateData.name);
    });

    it('should update only the provided fields', async () => {
      // Arrange
      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Original Name',
        description: 'Original description',
        activities: ['Original activity'],
      });

      const updateData = {
        name: 'Updated Name Only',
      };

      // Act
      const updatedDestination = await repository.updateDestination(
        destination.id,
        updateData,
      );

      // Assert
      expect(updatedDestination).toBeDefined();
      expect(updatedDestination.name).toBe(updateData.name);
      expect(updatedDestination.description).toBe(destination.description); // Should remain unchanged
    });
  });

  describe('deleteDestination', () => {
    it('should delete an existing destination', async () => {
      // Arrange
      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Destination to Delete',
      });

      // Verify the destination exists before deletion
      const destinationBeforeDelete = await repository.getDestinationById(
        TEST_IDS.DESTINATION_1,
      );
      expect(destinationBeforeDelete).toBeDefined();

      // Act
      await repository.deleteDestination(TEST_IDS.DESTINATION_1);

      // Assert
      const destinationAfterDelete = await repository.getDestinationById(
        TEST_IDS.DESTINATION_1,
      );
      expect(destinationAfterDelete).toBeUndefined();
    });

    it('should not throw error when deleting non-existent destination', async () => {
      // Act & Assert
      await expect(
        repository.deleteDestination(TEST_IDS.NON_EXISTENT_DESTINATION),
      ).resolves.not.toThrow();
    });

    it('should delete destination and its related trip associations (due to cascade)', async () => {
      // Arrange
      await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
      });

      await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Trip',
      });

      await tripToDestinationHelper.addDestinationToTrip(
        TEST_IDS.TRIP_1,
        TEST_IDS.DESTINATION_1,
      );
      // Verify relation exists before deletion
      const relations =
        await testDatabase.database.query.tripToDestinations.findMany({
          where: (tripToDest) =>
            eq(tripToDest.destinationId, TEST_IDS.DESTINATION_1),
        });
      expect(relations.length).toBeGreaterThan(0);

      // Act
      await repository.deleteDestination(TEST_IDS.DESTINATION_1); // Assert - relations should be deleted due to cascade constraint
      const relationsAfterDelete =
        await testDatabase.database.query.tripToDestinations.findMany({
          where: (tripToDest) =>
            eq(tripToDest.destinationId, TEST_IDS.DESTINATION_1),
        });
      expect(relationsAfterDelete.length).toBe(0);
    });
  });
});
