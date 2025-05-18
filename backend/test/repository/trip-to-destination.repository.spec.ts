import { TestDatabase } from '../helpers/database';
import { TripToDestinationRepository } from '../../src/database/repository/trip-to-destination.repository';
import { TripTestHelper } from '../helpers/trip';
import { DestinationTestHelper } from '../helpers/destination';
import { TripToDestinationTestHelper } from '../helpers/trip-to-destination';
import { and, eq } from 'drizzle-orm';
import { tripToDestinations } from '../../src/database/schema/trip-to-destination.schema';

/**
 * Integration tests for the TripToDestinationRepository class.
 * These tests verify the repository's interaction with the database.
 */
// Increase timeout for these tests as they require Docker setup
jest.setTimeout(60000); // 60 seconds, more than enough for container startup

const TEST_IDS = {
  TRIP_1: '123e4567-e89b-12d3-a456-426614174030',
  TRIP_2: '123e4567-e89b-12d3-a456-426614174031',
  DESTINATION_1: '123e4567-e89b-12d3-a456-426614174032',
  DESTINATION_2: '123e4567-e89b-12d3-a456-426614174033',
  NON_EXISTENT_TRIP: '123e4567-e89b-12d3-a456-999999999998',
  NON_EXISTENT_DESTINATION: '123e4567-e89b-12d3-a456-999999999999',
} as const;

describe('TripToDestinationRepository Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let repository: TripToDestinationRepository;
  let tripHelper: TripTestHelper;
  let destinationHelper: DestinationTestHelper;
  let tripToDestinationHelper: TripToDestinationTestHelper;

  beforeAll(async () => {
    await testDatabase.setup();
    repository = new TripToDestinationRepository(testDatabase.database);
    tripHelper = new TripTestHelper(testDatabase.database);
    destinationHelper = new DestinationTestHelper(testDatabase.database);
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
    await tripHelper.deleteAllTrips();
    await destinationHelper.deleteAllDestinations();
  });

  describe('addDestinationToTrip', () => {
    it('should add a destination to a trip', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Tour',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Rome',
      });

      // Act
      const relation = await repository.addDestinationToTrip(
        trip.id,
        destination.id,
      );

      // Assert
      expect(relation).toBeDefined();
      expect(relation.tripId).toBe(trip.id);
      expect(relation.destinationId).toBe(destination.id);

      // Verify relation exists in the database
      const checkRelation =
        await testDatabase.database.query.tripToDestinations.findFirst({
          where: and(
            eq(tripToDestinations.tripId, trip.id),
            eq(tripToDestinations.destinationId, destination.id),
          ),
        });
      expect(checkRelation).toBeDefined();
    });

    it('should add a destination to a trip with date range', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Spring Break',
        startDate: '2023-03-15',
        endDate: '2023-03-25',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Miami',
      });

      // Act
      const relation = await repository.addDestinationToTrip(
        trip.id,
        destination.id,
        {
          startDate: new Date('2023-03-17'),
          endDate: new Date('2023-03-22'),
        },
      );

      // Assert
      expect(relation).toBeDefined();
      expect(relation.tripId).toBe(trip.id);
      expect(relation.destinationId).toBe(destination.id);

      // Format the dates to ensure consistent comparison (DB might only store date, not time)
      const expectedStartDate = new Date('2023-03-17')
        .toISOString()
        .split('T')[0];
      const expectedEndDate = new Date('2023-03-22')
        .toISOString()
        .split('T')[0];

      // Extract just the date part for comparison
      const resultStartDate = relation.startDate
        ? new Date(relation.startDate).toISOString().split('T')[0]
        : null;
      const resultEndDate = relation.endDate
        ? new Date(relation.endDate).toISOString().split('T')[0]
        : null;

      expect(resultStartDate).toBe(expectedStartDate);
      expect(resultEndDate).toBe(expectedEndDate);
    });
  });

  describe('updateTripDestination', () => {
    it('should update a trip-destination relation with new date range', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Asian Tour',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Tokyo',
      });

      const initialRelation = await repository.addDestinationToTrip(
        trip.id,
        destination.id,
        {
          startDate: new Date('2023-10-01'),
          endDate: new Date('2023-10-05'),
        },
      );

      const updateData = {
        startDate: new Date('2023-10-10'),
        endDate: new Date('2023-10-15'),
      };

      // Act
      const updatedRelation = await repository.updateTripDestination(
        trip.id,
        destination.id,
        updateData,
      );

      // Assert
      expect(updatedRelation).toBeDefined();

      // Format the dates for comparison
      const expectedStartDate = new Date('2023-10-10')
        .toISOString()
        .split('T')[0];
      const expectedEndDate = new Date('2023-10-15')
        .toISOString()
        .split('T')[0];

      const resultStartDate = updatedRelation.startDate
        ? new Date(updatedRelation.startDate).toISOString().split('T')[0]
        : null;
      const resultEndDate = updatedRelation.endDate
        ? new Date(updatedRelation.endDate).toISOString().split('T')[0]
        : null;

      expect(resultStartDate).toBe(expectedStartDate);
      expect(resultEndDate).toBe(expectedEndDate);
    });

    it('should update only specified dates', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'European Tour',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Berlin',
      });

      const initialData = {
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-07-10'),
      };

      await repository.addDestinationToTrip(
        trip.id,
        destination.id,
        initialData,
      );

      // Update only the end date
      const updateData = {
        endDate: new Date('2023-07-15'),
      };

      // Act
      const updatedRelation = await repository.updateTripDestination(
        trip.id,
        destination.id,
        updateData,
      );

      // Assert
      expect(updatedRelation).toBeDefined();

      // Format the dates for comparison
      const expectedStartDate = new Date('2023-07-01')
        .toISOString()
        .split('T')[0]; // Should remain unchanged
      const expectedEndDate = new Date('2023-07-15')
        .toISOString()
        .split('T')[0]; // Should be updated

      const resultStartDate = updatedRelation.startDate
        ? new Date(updatedRelation.startDate).toISOString().split('T')[0]
        : null;
      const resultEndDate = updatedRelation.endDate
        ? new Date(updatedRelation.endDate).toISOString().split('T')[0]
        : null;

      expect(resultStartDate).toBe(expectedStartDate);
      expect(resultEndDate).toBe(expectedEndDate);
    });
  });

  describe('removeDestinationFromTrip', () => {
    it('should remove a destination from a trip', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Summer Trip',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Beach Resort',
      });

      await repository.addDestinationToTrip(trip.id, destination.id);

      // Verify relation exists before removal
      const beforeRemoval =
        await testDatabase.database.query.tripToDestinations.findFirst({
          where: and(
            eq(tripToDestinations.tripId, trip.id),
            eq(tripToDestinations.destinationId, destination.id),
          ),
        });
      expect(beforeRemoval).toBeDefined();

      // Act
      await repository.removeDestinationFromTrip(trip.id, destination.id);

      // Assert
      const afterRemoval =
        await testDatabase.database.query.tripToDestinations.findFirst({
          where: and(
            eq(tripToDestinations.tripId, trip.id),
            eq(tripToDestinations.destinationId, destination.id),
          ),
        });
      expect(afterRemoval).toBeUndefined();
    });

    it('should not throw error when removing non-existent relation', async () => {
      // Act & Assert
      await expect(
        repository.removeDestinationFromTrip(
          TEST_IDS.NON_EXISTENT_TRIP,
          TEST_IDS.NON_EXISTENT_DESTINATION,
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('getTripsForDestination', () => {
    it('should return trips for a specific destination', async () => {
      // Arrange
      const trip1 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Trip',
      });

      const trip2 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_2,
        name: 'America Trip',
      });

      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
      });

      // Only add Paris to Europe Trip
      await repository.addDestinationToTrip(trip1.id, destination.id);

      // Act
      const tripsWithDestination = await repository.getTripsForDestination(
        destination.id,
      );

      // Assert
      expect(tripsWithDestination).toHaveLength(1);
      expect(tripsWithDestination[0].trip.id).toBe(trip1.id);
      expect(tripsWithDestination[0].trip.name).toBe('Europe Trip');
    });

    it('should return empty array when destination has no trips', async () => {
      // Arrange
      const destination = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Unused Destination',
      });

      // Act
      const trips = await repository.getTripsForDestination(destination.id);

      // Assert
      expect(trips).toHaveLength(0);
    });
  });

  describe('getDestinationsForTrip', () => {
    it('should return destinations for a specific trip', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Europe Trip',
      });

      const destination1 = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_1,
        name: 'Paris',
      });

      const destination2 = await destinationHelper.createDestination({
        id: TEST_IDS.DESTINATION_2,
        name: 'Rome',
      });

      await repository.addDestinationToTrip(trip.id, destination1.id, {
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-06-05'),
      });

      await repository.addDestinationToTrip(trip.id, destination2.id, {
        startDate: new Date('2023-06-07'),
        endDate: new Date('2023-06-12'),
      });

      // Act
      const destinations = await repository.getDestinationsForTrip(trip.id);

      // Assert
      expect(destinations).toHaveLength(2);

      // Check that Paris is included
      const parisResult = destinations.find(
        (d) => d.destination.id === destination1.id,
      );
      expect(parisResult).toBeDefined();
      expect(parisResult?.destination.name).toBe('Paris');

      // Check that Rome is included
      const romeResult = destinations.find(
        (d) => d.destination.id === destination2.id,
      );
      expect(romeResult).toBeDefined();
      expect(romeResult?.destination.name).toBe('Rome');

      // Verify the dates were properly saved
      const parisStartDate = parisResult?.startDate
        ? new Date(parisResult.startDate).toISOString().split('T')[0]
        : null;
      expect(parisStartDate).toBe('2023-06-01');
    });

    it('should return empty array when trip has no destinations', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Empty Trip',
      });

      // Act
      const destinations = await repository.getDestinationsForTrip(trip.id);

      // Assert
      expect(destinations).toHaveLength(0);
    });
  });
});
