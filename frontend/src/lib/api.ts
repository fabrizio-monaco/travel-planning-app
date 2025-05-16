// API Types

// Trip types
export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  participants: string[];
  destinations?: TripDestination[];
}

export interface TripDestination {
  id: string;
  name: string;
  description: string;
  activities: string[];
  photos: string[];
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
}

// Destination types
export interface Destination {
  id: string;
  name: string;
  description: string;
  activities: string[];
  photos: string[];
  latitude?: number;
  longitude?: number;
  trips?: Trip[];
}

// Packing item types
export interface PackingItem {
  id: string;
  name: string;
  amount: number;
  tripId: string;
  trip?: Trip;
}

// Fuel station types
export interface FuelStation {
  id: string;
  name: string;
  distance: number;
  address: {
    formatted: string;
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  fuelTypes: string[];
  openingHours?: {
    open24h: boolean;
    text: string;
  };
}

// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Helper functions to normalize data from the API
const normalizeTrip = (trip: any): Trip => {
  if (!trip) return {} as Trip;
  
  return {
    ...trip,
    // Ensure participants is always a string array
    participants: Array.isArray(trip.participants) 
      ? trip.participants.map((p: any) => String(p)) 
      : typeof trip.participants === 'string'
        ? trip.participants.split(',').map((p: string) => p.trim()).filter(Boolean)
        : [],
    // Ensure destinations is always an array if present
    destinations: Array.isArray(trip.destinations) 
      ? trip.destinations.map((dest: any) => ({
          ...dest,
          // Ensure activities is an array
          activities: Array.isArray(dest.activities) ? dest.activities : [],
          // Ensure photos is an array
          photos: Array.isArray(dest.photos) ? dest.photos : []
        })) 
      : undefined
  };
};

// Helper function to normalize destination data
const normalizeDestination = (destination: any): Destination => {
  if (!destination) return {} as Destination;
  
  return {
    ...destination,
    // Ensure activities is always an array
    activities: Array.isArray(destination.activities) ? destination.activities : [],
    // Ensure photos is always an array
    photos: Array.isArray(destination.photos) ? destination.photos : [],
    // Ensure trips is always an array if present
    trips: Array.isArray(destination.trips) 
      ? destination.trips.map((trip: any) => normalizeTrip(trip))
      : undefined
  };
};

// Helper function to normalize packing item data
const normalizePackingItem = (item: any): PackingItem => {
  if (!item) return {} as PackingItem;
  
  return {
    ...item,
    // Ensure amount is a number
    amount: typeof item.amount === 'number' ? item.amount : parseInt(item.amount) || 1,
    // If trip is included, normalize it
    trip: item.trip ? normalizeTrip(item.trip) : undefined
  };
};

// API Service for Trips
export const tripApi = {
  // Get all trips
  async getAll(withRelations: boolean = false): Promise<Trip[]> {
    const response = await fetch(`${API_BASE_URL}/trips?withRelations=${withRelations}`);
    if (!response.ok) throw new Error('Failed to fetch trips');
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTrip) : [];
  },

  // Get a trip by ID
  async getById(id: string, withRelations: boolean = false): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/${id}?withRelations=${withRelations}`);
    if (!response.ok) throw new Error(`Failed to fetch trip with ID ${id}`);
    const data = await response.json();
    return normalizeTrip(data);
  },

  // Create a new trip
  async create(trip: Omit<Trip, 'id'>): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!response.ok) throw new Error('Failed to create trip');
    const data = await response.json();
    return normalizeTrip(data);
  },

  // Update a trip
  async update(id: string, trip: Partial<Trip>): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!response.ok) throw new Error(`Failed to update trip with ID ${id}`);
    const data = await response.json();
    return normalizeTrip(data);
  },

  // Delete a trip
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete trip with ID ${id}`);
  },

  // Search for trips
  async search(params: { query?: string; startDate?: string; endDate?: string; withRelations?: boolean }): Promise<Trip[]> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    searchParams.append('withRelations', String(params.withRelations || false));

    const response = await fetch(`${API_BASE_URL}/trips/search?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to search trips');
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTrip) : [];
  },

  // Get trips by destination
  async getByDestination(destinationId: string, withRelations: boolean = false): Promise<Trip[]> {
    const response = await fetch(`${API_BASE_URL}/trips/by-destination/${destinationId}?withRelations=${withRelations}`);
    if (!response.ok) throw new Error(`Failed to fetch trips for destination ${destinationId}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTrip) : [];
  },

  // Add destination to trip
  async addDestination(tripId: string, destinationId: string, dates: { startDate: string; endDate: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dates),
    });
    if (!response.ok) throw new Error(`Failed to add destination ${destinationId} to trip ${tripId}`);
  },

  // Update trip-destination relationship
  async updateDestination(tripId: string, destinationId: string, dates: { startDate: string; endDate: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dates),
    });
    if (!response.ok) throw new Error(`Failed to update destination ${destinationId} in trip ${tripId}`);
  },

  // Remove destination from trip
  async removeDestination(tripId: string, destinationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to remove destination ${destinationId} from trip ${tripId}`);
  },
};

// API Service for Destinations
export const destinationApi = {
  // Get all destinations
  async getAll(withRelations: boolean = false): Promise<Destination[]> {
    const response = await fetch(`${API_BASE_URL}/destinations?withRelations=${withRelations}`);
    if (!response.ok) throw new Error('Failed to fetch destinations');
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeDestination) : [];
  },

  // Get a destination by ID
  async getById(id: string, withRelations: boolean = false): Promise<Destination> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}?withRelations=${withRelations}`);
    if (!response.ok) throw new Error(`Failed to fetch destination with ID ${id}`);
    const data = await response.json();
    return normalizeDestination(data);
  },

  // Create a new destination
  async create(destination: Omit<Destination, 'id'>): Promise<Destination> {
    const response = await fetch(`${API_BASE_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(destination),
    });
    if (!response.ok) throw new Error('Failed to create destination');
    const data = await response.json();
    return normalizeDestination(data);
  },

  // Update a destination
  async update(id: string, destination: Partial<Destination>): Promise<Destination> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(destination),
    });
    if (!response.ok) throw new Error(`Failed to update destination with ID ${id}`);
    const data = await response.json();
    return normalizeDestination(data);
  },

  // Delete a destination
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete destination with ID ${id}`);
  },

  // Get trips for destination
  async getTrips(id: string): Promise<Trip[]> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}/trips`);
    if (!response.ok) throw new Error(`Failed to fetch trips for destination ${id}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTrip) : [];
  },

  // Get fuel stations near a destination
  async getFuelStations(id: string, radius: number = 5000): Promise<{ data: FuelStation[]; destination: Destination; radius: number }> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}/fuel-stations?radius=${radius}`);
    if (!response.ok) throw new Error(`Failed to fetch fuel stations for destination ${id}`);
    const data = await response.json();
    return {
      ...data,
      destination: normalizeDestination(data.destination)
    };
  },
};

// API Service for Packing Items
export const packingItemApi = {
  // Get all packing items
  async getAll(withRelations: boolean = false): Promise<PackingItem[]> {
    const response = await fetch(`${API_BASE_URL}/packing-items?withRelations=${withRelations}`);
    if (!response.ok) throw new Error('Failed to fetch packing items');
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizePackingItem) : [];
  },

  // Get a packing item by ID
  async getById(id: string, withRelations: boolean = false): Promise<PackingItem> {
    const response = await fetch(`${API_BASE_URL}/packing-items/${id}?withRelations=${withRelations}`);
    if (!response.ok) throw new Error(`Failed to fetch packing item with ID ${id}`);
    const data = await response.json();
    return normalizePackingItem(data);
  },

  // Create a new packing item
  async create(packingItem: Omit<PackingItem, 'id'>): Promise<PackingItem> {
    const response = await fetch(`${API_BASE_URL}/packing-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packingItem),
    });
    if (!response.ok) throw new Error('Failed to create packing item');
    const data = await response.json();
    return normalizePackingItem(data);
  },

  // Update a packing item
  async update(id: string, packingItem: Partial<PackingItem>): Promise<PackingItem> {
    const response = await fetch(`${API_BASE_URL}/packing-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packingItem),
    });
    if (!response.ok) throw new Error(`Failed to update packing item with ID ${id}`);
    const data = await response.json();
    return normalizePackingItem(data);
  },

  // Delete a packing item
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/packing-items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete packing item with ID ${id}`);
  },

  // Get packing items for trip
  async getByTrip(tripId: string, withRelations: boolean = false): Promise<PackingItem[]> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/packing-items?withRelations=${withRelations}`);
    if (!response.ok) throw new Error(`Failed to fetch packing items for trip ${tripId}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizePackingItem) : [];
  },

  // Delete all packing items for trip
  async deleteByTrip(tripId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/packing-items`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete packing items for trip ${tripId}`);
  },
};