// API service for destinations
import { Destination, FuelStationResponse } from '@/types';

const BASE_URL = 'http://localhost:5001/api';

export const destinationsApi = {
  // Get all destinations
  async getAllDestinations(
    withRelations: boolean = false
  ): Promise<Destination[]> {
    const response = await fetch(
      `${BASE_URL}/destinations?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch destinations');
    }
    return response.json();
  },

  // Get a destination by ID
  async getDestinationById(
    id: string,
    withRelations: boolean = false
  ): Promise<Destination> {
    const response = await fetch(
      `${BASE_URL}/destinations/${id}?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch destination with ID: ${id}`);
    }
    return response.json();
  },

  // Create a new destination
  async createDestination(
    destination: Omit<Destination, 'id'>
  ): Promise<Destination> {
    const response = await fetch(`${BASE_URL}/destinations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(destination),
    });
    if (!response.ok) {
      throw new Error('Failed to create destination');
    }
    return response.json();
  },
  // Update a destination
  async updateDestination(
    id: string,
    destination: Partial<Destination>
  ): Promise<Destination> {
    // Create a clean update object
    const updateData: any = {
      name: destination.name,
      description: destination.description,
      latitude: destination.latitude,
      longitude: destination.longitude,
    };

    // If activities is provided, parse it from JSON string to array for the API
    if (destination.activities) {
      try {
        updateData.activities = JSON.parse(destination.activities);
      } catch (e) {
        // If it's not valid JSON, use it as is
        updateData.activities = destination.activities;
      }
    }

    // If photos is provided, parse it from JSON string to array for the API
    if (destination.photos) {
      try {
        updateData.photos = JSON.parse(destination.photos);
      } catch (e) {
        // If it's not valid JSON, use it as is
        updateData.photos = destination.photos;
      }
    }

    console.log('Updating destination with ID:', id, 'Data:', updateData);
    const response = await fetch(`${BASE_URL}/destinations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update destination with ID: ${id}`);
    }
    return response.json();
  },

  // Delete a destination
  async deleteDestination(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/destinations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete destination with ID: ${id}`);
    }
  },

  // Get trips for a destination
  async getTripsForDestination(id: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/destinations/${id}/trips`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trips for destination with ID: ${id}`);
    }
    return response.json();
  },

  // Get fuel stations for a destination
  async getFuelStations(
    radius: number,
    destinationId: string
  ): Promise<FuelStationResponse> {
    const response = await fetch(
      `${BASE_URL}/destinations/${destinationId}/fuel-stations?radius=${radius}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch fuel stations for destination with ID: ${destinationId}`
      );
    }
    return response.json();
  },
};
