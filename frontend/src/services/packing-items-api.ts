// API service for packing items
import { PackingItem } from '@/types';

const BASE_URL = 'http://localhost:5001/api';

export const packingItemsApi = {
  // Get all packing items
  async getAllPackingItems(
    withRelations: boolean = false
  ): Promise<PackingItem[]> {
    const response = await fetch(
      `${BASE_URL}/packing-items?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch packing items');
    }
    return response.json();
  },

  // Get a packing item by ID
  async getPackingItemById(
    id: string,
    withRelations: boolean = false
  ): Promise<PackingItem> {
    const response = await fetch(
      `${BASE_URL}/packing-items/${id}?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch packing item with ID: ${id}`);
    }
    return response.json();
  },

  // Create a new packing item
  async createPackingItem(
    packingItem: Omit<PackingItem, 'id'>
  ): Promise<PackingItem> {
    const response = await fetch(`${BASE_URL}/packing-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packingItem),
    });
    if (!response.ok) {
      throw new Error('Failed to create packing item');
    }
    return response.json();
  },

  // Update a packing item
  async updatePackingItem(
    id: string,
    packingItem: Partial<PackingItem>
  ): Promise<PackingItem> {
    const response = await fetch(`${BASE_URL}/packing-items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packingItem),
    });
    if (!response.ok) {
      throw new Error(`Failed to update packing item with ID: ${id}`);
    }
    return response.json();
  },

  // Delete a packing item
  async deletePackingItem(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/packing-items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete packing item with ID: ${id}`);
    }
  },

  // Get packing items for a trip
  async getPackingItemsForTrip(
    tripId: string,
    withRelations: boolean = false
  ): Promise<PackingItem[]> {
    const response = await fetch(
      `${BASE_URL}/trips/${tripId}/packing-items?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch packing items for trip with ID: ${tripId}`
      );
    }
    return response.json();
  },

  // Delete all packing items for a trip
  async deleteAllPackingItemsForTrip(tripId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/packing-items`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(
        `Failed to delete all packing items for trip with ID: ${tripId}`
      );
    }
  },
};
