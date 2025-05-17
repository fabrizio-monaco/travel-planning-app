// Type definitions for the application
export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  participants: string; // Stored as stringified JSON array
  destinations?: TripDestination[];
  tripToDestinations?: TripDestination[]; // Add this to match backend response
  packingItems?: PackingItem[];
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  activities: string;
  photos: string; // Changed from string[] to string to handle as JSON string like activities
  latitude?: number;
  longitude?: number;
  trips?: TripDestination[];
}

export interface TripDestination {
  tripId: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  trip?: Trip;
  destination?: Destination;
}

export interface PackingItem {
  id: string;
  name: string;
  amount: number;
  tripId: string;
  trip?: Trip;
}

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

export interface FuelStationResponse {
  data: FuelStation[];
  destination: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  radius: number;
}
