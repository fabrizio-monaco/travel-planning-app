import axios from 'axios';
import { ENV } from '../config/env.config';

/**
 * Represents a fuel station returned from the API
 */
export interface FuelStation {
  id: string;
  name: string;
  distance: number; // distance in meters
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
  fuelTypes?: string[]; // Optional array of available fuel types
  openingHours?: {
    open24h: boolean;
    text: string;
  };
}

export class GeoapifyService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.geoapify.com/v2/places';

  constructor() {
    this.apiKey = ENV.GEOAPIFY_API_KEY;
    if (!this.apiKey) {
      console.warn('GEOAPIFY_API_KEY is not set in environment variables');
    }
  }

  /**
   * Fetch fuel stations around a specific location
   *
   * @param longitude - The longitude coordinate
   * @param latitude - The latitude coordinate
   * @param radius - The search radius in meters (max 20000)
   * @returns An array of fuel stations
   */
  async getFuelStations(
    longitude: number,
    latitude: number,
    radius: number = 5000,
  ): Promise<FuelStation[]> {
    // Ensure radius doesn't exceed maximum allowed
    const validRadius = Math.min(radius, 20000);

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          categories: 'service.vehicle.fuel',
          filter: `circle:${longitude},${latitude},${validRadius}`,
          bias: `proximity:${longitude},${latitude}`,
          limit: 20,
          apiKey: this.apiKey,
        },
      });

      if (!response.data || !response.data.features) {
        return [];
      }

      // Transform the response into a more usable format
      return response.data.features.map((feature: any) => {
        const props = feature.properties;

        // Extract fuel types from fuel_options if available
        const fuelTypes: string[] = [];
        if (props.fuel_options) {
          if (props.fuel_options.diesel) fuelTypes.push('diesel');
          if (props.fuel_options.e10) fuelTypes.push('e10');
          if (props.fuel_options.e5 || props.fuel_options.octane_95)
            fuelTypes.push('e5/95');
          if (props.fuel_options.e98 || props.fuel_options.octane_98)
            fuelTypes.push('e98');
          if (props.fuel_options.lpg) fuelTypes.push('lpg');
          if (props.fuel_options.cng) fuelTypes.push('cng');
        } else {
          // Fallback to direct properties if fuel_options is not available
          if (props.fuel_diesel) fuelTypes.push('diesel');
          if (props.fuel_e10) fuelTypes.push('e10');
          if (props.fuel_octane_95) fuelTypes.push('e5/95');
          if (props.fuel_octane_98) fuelTypes.push('e98');
          if (props.fuel_lpg) fuelTypes.push('lpg');
        }

        // Check for EV charging
        if (
          (props.facilities && props.facilities.ev_charging) ||
          props.ev_charging
        ) {
          fuelTypes.push('electric');
        }

        // Create a fuel station object
        return {
          id: props.place_id || props.id,
          name: props.name || 'Unknown Gas Station',
          distance: props.distance,
          address: {
            formatted: props.formatted || '',
            street: props.street || '',
            city: props.city || '',
            postcode: props.postcode || '',
            country: props.country || '',
          },
          location: {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          },
          fuelTypes: fuelTypes.length > 0 ? fuelTypes : undefined,
          openingHours: props.opening_hours
            ? {
                open24h: props.opening_hours.includes('24/7'),
                text: props.opening_hours,
              }
            : undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching fuel stations:', error);
      throw new Error('Failed to fetch fuel stations from Geoapify API');
    }
  }
}
