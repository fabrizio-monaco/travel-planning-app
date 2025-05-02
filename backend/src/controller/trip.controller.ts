import { Request, Response } from 'express';
import { z } from 'zod';
import { TripRepository } from '../database/repository/trip.repository';
import { TripToDestinationRepository } from '../database/repository/trip-to-destination.repository';
import {
  createTripZodSchema,
  updateTripZodSchema,
  tripToDestinationZodSchema,
  tripSearchZodSchema,
} from '../validation/validation';

export class TripController {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly tripToDestinationRepository: TripToDestinationRepository,
  ) {}

  async getAllTrips(req: Request, res: Response): Promise<void> {
    try {
      // Check if withRelations query parameter is present
      const withRelations = req.query.withRelations === 'true';

      const trips = await this.tripRepository.getAllTrips(withRelations);
      res.send(trips);
    } catch (error) {
      console.error('Error retrieving trips:', error);
      res.status(500).json({ errors: ['Error retrieving trips'] });
    }
  }

  async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if withRelations query parameter is present
      const withRelations = req.query.withRelations === 'true';

      const validatedId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      const trip = await this.tripRepository.getTripById(
        validatedId.data,
        withRelations,
      );

      if (!trip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      res.send(trip);
    } catch (error) {
      console.error('Error retrieving trip:', error);
      res.status(500).json({ errors: ['Error retrieving trip'] });
    }
  }

  async createTrip(req: Request, res: Response): Promise<void> {
    try {
      const validation = createTripZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid trip data'] });
        return;
      }

      const trip = await this.tripRepository.createTrip(validation.data);
      res.status(201).send(trip);
    } catch (error) {
      console.error('Error creating trip:', error);
      res.status(500).json({ errors: ['Error creating trip'] });
    }
  }

  async updateTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      // Check if trip exists
      const existingTrip = await this.tripRepository.getTripById(
        validatedId.data,
      );
      if (!existingTrip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      // Validate update data
      const validation = updateTripZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid trip data'] });
        return;
      }

      const updatedTrip = await this.tripRepository.updateTrip(
        validatedId.data,
        validation.data,
      );
      res.send(updatedTrip);
    } catch (error) {
      console.error('Error updating trip:', error);
      res.status(500).json({ errors: ['Error updating trip'] });
    }
  }

  async deleteTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      // Check if trip exists
      const existingTrip = await this.tripRepository.getTripById(
        validatedId.data,
      );
      if (!existingTrip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      await this.tripRepository.deleteTrip(validatedId.data);
      res.status(204).send({});
    } catch (error) {
      console.error('Error deleting trip:', error);
      res.status(500).json({ errors: ['Error deleting trip'] });
    }
  }

  async searchTrips(req: Request, res: Response): Promise<void> {
    try {
      // Check if withRelations query parameter is present
      const withRelations = req.query.withRelations === 'true';

      const validation = tripSearchZodSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid search parameters'] });
        return;
      }

      const { query, startDate, endDate } = validation.data;
      // Pass empty string if query is undefined
      const trips = await this.tripRepository.searchTrips(
        query || '',
        startDate,
        endDate,
        withRelations,
      );
      res.send(trips);
    } catch (error) {
      console.error('Error searching trips:', error);
      res.status(500).json({ errors: ['Error searching trips'] });
    }
  }

  async getTripsByDestination(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId } = req.params;
      // Check if withRelations query parameter is present
      const withRelations = req.query.withRelations === 'true';

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

      const trips = await this.tripRepository.getTripsByDestination(
        validatedId.data,
        withRelations,
      );
      res.send(trips);
    } catch (error) {
      console.error('Error retrieving trips by destination:', error);
      res
        .status(500)
        .json({ errors: ['Error retrieving trips by destination'] });
    }
  }

  async addDestinationToTrip(req: Request, res: Response): Promise<void> {
    try {
      const { tripId, destinationId } = req.params;

      const validatedTripId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(tripId);

      const validatedDestinationId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(destinationId);

      if (!validatedTripId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      if (!validatedDestinationId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      const validation = tripToDestinationZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid trip-destination data'] });
        return;
      }

      // Verify that trip exists
      const trip = await this.tripRepository.getTripById(validatedTripId.data);
      if (!trip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      const relation =
        await this.tripToDestinationRepository.addDestinationToTrip(
          validatedTripId.data,
          validatedDestinationId.data,
          validation.data,
        );

      res.status(201).send(relation);
    } catch (error) {
      console.error('Error adding destination to trip:', error);

      // Handle unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes('duplicate key value')
      ) {
        res.status(409).json({
          errors: ['This destination is already associated with the trip'],
        });
        return;
      }

      // Handle foreign key constraint violation
      if (
        error instanceof Error &&
        error.message.includes('foreign key constraint')
      ) {
        res.status(404).json({ errors: ['Trip or destination not found'] });
        return;
      }

      res.status(500).json({ errors: ['Error adding destination to trip'] });
    }
  }

  async updateTripDestination(req: Request, res: Response): Promise<void> {
    try {
      const { tripId, destinationId } = req.params;

      const validatedTripId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(tripId);

      const validatedDestinationId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(destinationId);

      if (!validatedTripId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      if (!validatedDestinationId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      const validation = tripToDestinationZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid trip-destination data'] });
        return;
      }

      const relation =
        await this.tripToDestinationRepository.updateTripDestination(
          validatedTripId.data,
          validatedDestinationId.data,
          validation.data,
        );

      if (!relation) {
        res
          .status(404)
          .json({ errors: ['Trip-destination relationship not found'] });
        return;
      }

      res.send(relation);
    } catch (error) {
      console.error('Error updating trip destination:', error);
      res.status(500).json({ errors: ['Error updating trip destination'] });
    }
  }

  async removeDestinationFromTrip(req: Request, res: Response): Promise<void> {
    try {
      const { tripId, destinationId } = req.params;

      const validatedTripId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(tripId);

      const validatedDestinationId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(destinationId);

      if (!validatedTripId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      if (!validatedDestinationId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      await this.tripToDestinationRepository.removeDestinationFromTrip(
        validatedTripId.data,
        validatedDestinationId.data,
      );
      res.status(204).send({});
    } catch (error) {
      console.error('Error removing destination from trip:', error);
      res
        .status(500)
        .json({ errors: ['Error removing destination from trip'] });
    }
  }
}
