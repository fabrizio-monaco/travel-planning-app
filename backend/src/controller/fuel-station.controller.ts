import { Request, Response } from 'express';
import { z } from 'zod';
import { DestinationRepository } from '../database/repository/destination.repository';
import { GeoapifyService } from '../services/geoapify.service';

export class FuelStationController {
  constructor(
    private readonly destinationRepository: DestinationRepository,
    private readonly geoapifyService: GeoapifyService,
  ) {}

  /**
   * Get fuel stations near a destination
   * Uses the destination's latitude and longitude to find nearby fuel stations
   */
  async getFuelStationsByDestination(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { destinationId } = req.params;

      // Validate destinationId as UUID
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(destinationId);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      // Validate radius parameter if provided
      const radiusParam = req.query.radius ? String(req.query.radius) : '5000';
      const radiusValidation = z
        .number()
        .int()
        .positive()
        .max(20000, { message: 'Maximum radius is 20000 meters (20 km)' })
        .safeParse(parseInt(radiusParam));

      if (!radiusValidation.success) {
        res.status(400).json({
          errors: [
            'Invalid radius. Please provide a positive integer less than or equal to 20000 (20 km).',
          ],
        });
        return;
      }

      // Get destination details from database
      const destination = await this.destinationRepository.getDestinationById(
        validatedId.data,
      );

      if (!destination) {
        res.status(404).json({ errors: ['Destination not found'] });
        return;
      }

      // Check if destination has latitude and longitude
      if (destination.latitude === null || destination.longitude === null) {
        res.status(400).json({
          errors: [
            'Destination does not have geographic coordinates (latitude/longitude)',
          ],
        });
        return;
      }

      // Call the Geoapify service to fetch fuel stations
      const fuelStations = await this.geoapifyService.getFuelStations(
        destination.longitude!,
        destination.latitude!,
        radiusValidation.data,
      );

      res.status(200).json({
        data: fuelStations,
        destination: {
          id: destination.id,
          name: destination.name,
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        radius: radiusValidation.data,
      });
    } catch (error) {
      console.error('Error fetching fuel stations:', error);
      res.status(500).json({ errors: ['Error fetching fuel stations'] });
    }
  }
}
