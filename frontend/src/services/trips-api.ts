// API service for trips
import { Trip } from '@/types';

const BASE_URL = 'http://localhost:5001/api';

export const tripsApi = {
  // Get all trips
  async getAllTrips(withRelations: boolean = false): Promise<Trip[]> {
    const response = await fetch(
      `${BASE_URL}/trips?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }
    return response.json();
  },

  // Get a trip by ID
  async getTripById(id: string, withRelations: boolean = false): Promise<Trip> {
    const response = await fetch(
      `${BASE_URL}/trips/${id}?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch trip with ID: ${id}`);
    }
    return response.json();
  },

  // Create a new trip
  async createTrip(trip: Omit<Trip, 'id'>): Promise<Trip> {
    const response = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trip),
    });
    if (!response.ok) {
      throw new Error('Failed to create trip');
    }
    return response.json();
  }, // Update a trip
  async updateTrip(id: string, trip: Partial<Trip>): Promise<Trip> {
    // Create a clean update object
    const updateData: any = {
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      image: trip.image,
    };

    // If participants is provided, parse it from JSON string to array for the API
    if (trip.participants) {
      try {
        updateData.participants = JSON.parse(trip.participants);
      } catch (e) {
        // If it's not valid JSON, use it as is
        updateData.participants = trip.participants;
      }
    }

    const response = await fetch(`${BASE_URL}/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update trip with ID: ${id}`);
    }
    return response.json();
  },

  // Delete a trip
  async deleteTrip(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/trips/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete trip with ID: ${id}`);
    }
  },

  // Search trips
  async searchTrips(
    query?: string,
    startDate?: string,
    endDate?: string,
    withRelations: boolean = false
  ): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('withRelations', withRelations.toString());

    const response = await fetch(
      `${BASE_URL}/trips/search?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to search trips');
    }
    return response.json();
  },

  // Get trips by destination
  async getTripsByDestination(
    destinationId: string,
    withRelations: boolean = false
  ): Promise<Trip[]> {
    const response = await fetch(
      `${BASE_URL}/trips/by-destination/${destinationId}?withRelations=${withRelations}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch trips for destination with ID: ${destinationId}`
      );
    }
    return response.json();
  },

  // Add destination to trip
  async addDestinationToTrip(
    tripId: string,
    destinationId: string,
    data: { startDate: string; endDate: string }
  ): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/trips/${tripId}/destinations/${destinationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to add destination to trip`);
    }
  },

  // Update trip-destination relationship
  async updateTripDestination(
    tripId: string,
    destinationId: string,
    data: { startDate: string; endDate: string }
  ): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/trips/${tripId}/destinations/${destinationId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to update trip-destination relationship`);
    }
  },

  // Remove destination from trip
  async removeDestinationFromTrip(
    tripId: string,
    destinationId: string
  ): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/trips/${tripId}/destinations/${destinationId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to remove destination from trip`);
    }
  },
};
