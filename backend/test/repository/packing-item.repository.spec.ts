import { TestDatabase } from '../helpers/database';
import { PackingItemRepository } from '../../src/database/repository/packing-item.repository';
import { PackingItemTestHelper } from '../helpers/packing-item';
import { TripTestHelper } from '../helpers/trip';
import { eq } from 'drizzle-orm';

/**
 * Integration tests for the PackingItemRepository class.
 * These tests verify the repository's interaction with the database.
 */
const TEST_IDS = {
  PACKING_ITEM_1: '123e4567-e89b-12d3-a456-426614174020',
  PACKING_ITEM_2: '123e4567-e89b-12d3-a456-426614174021',
  TRIP_1: '123e4567-e89b-12d3-a456-426614174022',
  TRIP_2: '123e4567-e89b-12d3-a456-426614174023',
  NON_EXISTENT_ITEM: '123e4567-e89b-12d3-a456-999999999999',
} as const;

describe('PackingItemRepository Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let repository: PackingItemRepository;
  let packingItemHelper: PackingItemTestHelper;
  let tripHelper: TripTestHelper;

  jest.setTimeout(30000);

  beforeAll(async () => {
    await testDatabase.setup();
    repository = new PackingItemRepository(testDatabase.database);
    packingItemHelper = new PackingItemTestHelper(testDatabase.database);
    tripHelper = new TripTestHelper(testDatabase.database);
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  beforeEach(async () => {
    // Clean up before each test
    await packingItemHelper.deleteAllPackingItems();
    await tripHelper.deleteAllTrips();
  });

  describe('getAllPackingItems', () => {
    it('should return empty array when no packing items exist', async () => {
      // Act
      const items = await repository.getAllPackingItems();

      // Assert
      expect(items).toEqual([]);
    });

    it('should return all packing items without relations', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Beach Trip',
      });

      const item1 = await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Sunscreen',
        amount: 1,
        tripId: trip.id,
      });

      const item2 = await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_2,
        name: 'Beach Towel',
        amount: 2,
        tripId: trip.id,
      });

      // Act
      const items = await repository.getAllPackingItems();

      // Assert
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(item1.id);
      expect(items[1].id).toBe(item2.id);
    });

    it('should return all packing items with relations when withRelations is true', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Camping Trip',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Tent',
        amount: 1,
        tripId: trip.id,
      }); // Act
      const items = await repository.getAllPackingItems(true);

      // Assert
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(TEST_IDS.PACKING_ITEM_1);
      // Using type assertion to handle the dynamically loaded relations
      const itemsWithRelations = items as any[];
      expect(itemsWithRelations[0].trip.id).toBe(trip.id);
      expect(itemsWithRelations[0].trip.name).toBe('Camping Trip');
    });
  });

  describe('getPackingItemById', () => {
    it('should return undefined for non-existent packing item', async () => {
      // Act
      const result = await repository.getPackingItemById(
        TEST_IDS.NON_EXISTENT_ITEM,
      );

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return packing item without relations', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Mountain Trip',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Hiking Boots',
        amount: 1,
        tripId: trip.id,
      });

      // Act
      const item = await repository.getPackingItemById(TEST_IDS.PACKING_ITEM_1);

      // Assert
      expect(item).toBeDefined();
      expect(item?.id).toBe(TEST_IDS.PACKING_ITEM_1);
      expect(item?.name).toBe('Hiking Boots');
      expect(item?.amount).toBe(1);
      expect(item?.tripId).toBe(trip.id);
    });

    it('should return packing item with relations when withRelations is true', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Winter Trip',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Gloves',
        amount: 1,
        tripId: trip.id,
      });

      // Act
      const item = await repository.getPackingItemById(
        TEST_IDS.PACKING_ITEM_1,
        true,
      ); // Assert
      expect(item).toBeDefined();
      expect(item?.id).toBe(TEST_IDS.PACKING_ITEM_1);
      // Using type assertion to handle the dynamically loaded relations
      const itemWithRelations = item as any;
      expect(itemWithRelations.trip).toBeDefined();
      expect(itemWithRelations.trip.id).toBe(trip.id);
      expect(itemWithRelations.trip.name).toBe('Winter Trip');
    });
  });

  describe('getPackingItemsByTripId', () => {
    it('should return empty array for trip with no packing items', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Empty Trip',
      });

      // Act
      const items = await repository.getPackingItemsByTripId(trip.id);

      // Assert
      expect(items).toHaveLength(0);
    });

    it('should return packing items for a specific trip', async () => {
      // Arrange
      const trip1 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip 1',
      });

      const trip2 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_2,
        name: 'Trip 2',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Item for Trip 1',
        amount: 1,
        tripId: trip1.id,
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_2,
        name: 'Item for Trip 2',
        amount: 1,
        tripId: trip2.id,
      });

      // Act
      const items = await repository.getPackingItemsByTripId(trip1.id);

      // Assert
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Item for Trip 1');
      expect(items[0].tripId).toBe(trip1.id);
    });

    it('should return packing items with trip relation when withRelations is true', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip with Items',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Item with Relation',
        tripId: trip.id,
      });

      // Act
      const items = await repository.getPackingItemsByTripId(trip.id, true); // Assert
      expect(items).toHaveLength(1);
      // Using type assertion to handle the dynamically loaded relations
      const itemsWithRelations = items as any[];
      expect(itemsWithRelations[0].trip).toBeDefined();
      expect(itemsWithRelations[0].trip.id).toBe(trip.id);
      expect(itemsWithRelations[0].trip.name).toBe('Trip with Items');
    });
  });

  describe('createPackingItem', () => {
    it('should create a packing item with valid data', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'New Trip',
      });

      const itemData = {
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'New Item',
        amount: 3,
        tripId: trip.id,
      };

      // Act
      const item = await repository.createPackingItem(itemData);

      // Assert
      expect(item).toBeDefined();
      expect(item.id).toBe(itemData.id);
      expect(item.name).toBe(itemData.name);
      expect(item.amount).toBe(itemData.amount);
      expect(item.tripId).toBe(trip.id);

      // Verify the item was saved to the database
      const savedItem = await repository.getPackingItemById(item.id);
      expect(savedItem).toBeDefined();
      expect(savedItem?.name).toBe(itemData.name);
    });
  });

  describe('updatePackingItem', () => {
    it('should update a packing item with valid data', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Original Item',
        amount: 1,
        tripId: trip.id,
      });

      const updateData = {
        name: 'Updated Item',
        amount: 5,
      };

      // Act
      const updatedItem = await repository.updatePackingItem(
        TEST_IDS.PACKING_ITEM_1,
        updateData,
      );

      // Assert
      expect(updatedItem).toBeDefined();
      expect(updatedItem.id).toBe(TEST_IDS.PACKING_ITEM_1);
      expect(updatedItem.name).toBe(updateData.name);
      expect(updatedItem.amount).toBe(updateData.amount);
      expect(updatedItem.tripId).toBe(trip.id); // Should remain unchanged

      // Verify the changes were saved to the database
      const savedItem = await repository.getPackingItemById(
        TEST_IDS.PACKING_ITEM_1,
      );
      expect(savedItem?.name).toBe(updateData.name);
      expect(savedItem?.amount).toBe(updateData.amount);
    });

    it('should update only the provided fields', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Original Item',
        amount: 1,
        tripId: trip.id,
      });

      const updateData = {
        name: 'Updated Name Only',
      };

      // Act
      const updatedItem = await repository.updatePackingItem(
        TEST_IDS.PACKING_ITEM_1,
        updateData,
      );

      // Assert
      expect(updatedItem).toBeDefined();
      expect(updatedItem.name).toBe(updateData.name);
      expect(updatedItem.amount).toBe(1); // Should remain unchanged
    });
  });

  describe('deletePackingItem', () => {
    it('should delete an existing packing item', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip',
      });

      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Item to Delete',
        tripId: trip.id,
      });

      // Verify the item exists before deletion
      const itemBeforeDelete = await repository.getPackingItemById(
        TEST_IDS.PACKING_ITEM_1,
      );
      expect(itemBeforeDelete).toBeDefined();

      // Act
      await repository.deletePackingItem(TEST_IDS.PACKING_ITEM_1);

      // Assert
      const itemAfterDelete = await repository.getPackingItemById(
        TEST_IDS.PACKING_ITEM_1,
      );
      expect(itemAfterDelete).toBeUndefined();
    });

    it('should not throw error when deleting non-existent packing item', async () => {
      // Act & Assert
      await expect(
        repository.deletePackingItem(TEST_IDS.NON_EXISTENT_ITEM),
      ).resolves.not.toThrow();
    });
  });

  describe('deletePackingItemsByTripId', () => {
    it('should delete all packing items for a specific trip', async () => {
      // Arrange
      const trip1 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Trip 1',
      });

      const trip2 = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_2,
        name: 'Trip 2',
      });

      // Create items for first trip
      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_1,
        name: 'Item 1 for Trip 1',
        tripId: trip1.id,
      });

      await packingItemHelper.createPackingItem({
        name: 'Item 2 for Trip 1',
        tripId: trip1.id,
      });

      // Create item for second trip
      await packingItemHelper.createPackingItem({
        id: TEST_IDS.PACKING_ITEM_2,
        name: 'Item for Trip 2',
        tripId: trip2.id,
      });

      // Verify items exist before deletion
      const trip1ItemsBefore = await repository.getPackingItemsByTripId(
        trip1.id,
      );
      expect(trip1ItemsBefore).toHaveLength(2);

      const trip2ItemsBefore = await repository.getPackingItemsByTripId(
        trip2.id,
      );
      expect(trip2ItemsBefore).toHaveLength(1);

      // Act
      await repository.deletePackingItemsByTripId(trip1.id);

      // Assert
      const trip1ItemsAfter = await repository.getPackingItemsByTripId(
        trip1.id,
      );
      expect(trip1ItemsAfter).toHaveLength(0); // Items for Trip 1 should be deleted

      const trip2ItemsAfter = await repository.getPackingItemsByTripId(
        trip2.id,
      );
      expect(trip2ItemsAfter).toHaveLength(1); // Items for Trip 2 should remain
    });

    it('should not throw error when deleting items for a trip with no items', async () => {
      // Arrange
      const trip = await tripHelper.createTrip({
        id: TEST_IDS.TRIP_1,
        name: 'Empty Trip',
      });

      // Act & Assert
      await expect(
        repository.deletePackingItemsByTripId(trip.id),
      ).resolves.not.toThrow();
    });
  });
});
