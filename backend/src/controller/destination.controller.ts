import { Request, Response } from 'express';
import { z } from 'zod';
import { DestinationRepository } from '../database/repository/destination.repository';
import { TripToDestinationRepository } from '../database/repository/trip-to-destination.repository';
import {
  createDestinationZodSchema,
  updateDestinationZodSchema,
} from '../validation/validation';

export class DestinationController {
  constructor(
    private readonly destinationRepository: DestinationRepository,
    private readonly tripToDestinationRepository: TripToDestinationRepository,
  ) {}
  async getAllDestinations(req: Request, res: Response): Promise<void> {
    try {
      // Check if withRelations query parameter is present
      const withRelations = req.query.withRelations === 'true';

      const destinations =
        await this.destinationRepository.getAllDestinations(withRelations);
      res.send(destinations);
    } catch (error) {
      console.error('Error retrieving destinations:', error);
      res.status(500).json({ errors: ['Error retrieving destinations'] });
    }
  }

  async getDestinationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if withRelations query parameter is present
      const withRelations = req.query.withRelations === 'true';

      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      const destination = await this.destinationRepository.getDestinationById(
        validatedId.data,
        withRelations,
      );

      if (!destination) {
        res.status(404).json({ errors: ['Destination not found'] });
        return;
      }

      res.send(destination);
    } catch (error) {
      console.error('Error retrieving destination:', error);
      res.status(500).json({ errors: ['Error retrieving destination'] });
    }
  }

  async createDestination(req: Request, res: Response): Promise<void> {
    try {
      const validation = createDestinationZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid destination data'] });
        return;
      }

      const destination = await this.destinationRepository.createDestination(
        validation.data,
      );
      res.status(201).send(destination);
    } catch (error) {
      console.error('Error creating destination:', error);
      res.status(500).json({ errors: ['Error creating destination'] });
    }
  }

  async updateDestination(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      // Check if destination exists - no need for relations
      const existingDestination =
        await this.destinationRepository.getDestinationById(
          validatedId.data,
          false,
        );
      if (!existingDestination) {
        res.status(404).json({ errors: ['Destination not found'] });
        return;
      }

      // Validate update data
      const validation = updateDestinationZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: ['Invalid destination data'] });
        return;
      }

      const updatedDestination =
        await this.destinationRepository.updateDestination(
          validatedId.data,
          validation.data,
        );
      res.send(updatedDestination);
    } catch (error) {
      console.error('Error updating destination:', error);
      res.status(500).json({ errors: ['Error updating destination'] });
    }
  }

  async deleteDestination(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      // Check if destination exists - no need for relations
      const existingDestination =
        await this.destinationRepository.getDestinationById(
          validatedId.data,
          false,
        );
      if (!existingDestination) {
        res.status(404).json({ errors: ['Destination not found'] });
        return;
      }

      await this.destinationRepository.deleteDestination(validatedId.data);
      res.status(204).send({});
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ errors: ['Error deleting destination'] });
    }
  }
  async getTripsForDestination(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid destination id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid destination id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      // Check if destination exists first
      const destination = await this.destinationRepository.getDestinationById(
        validatedId.data,
        false,
      );

      if (!destination) {
        res.status(404).json({ errors: ['Destination not found'] });
        return;
      }

      const tripRelations =
        await this.tripToDestinationRepository.getTripsForDestination(
          validatedId.data,
        );

      // Extract just the trip data from the relations
      const trips = tripRelations.map((relation) => relation.trip);

      res.send(trips);
    } catch (error) {
      console.error('Error retrieving trips for destination:', error);
      res
        .status(500)
        .json({ errors: ['Error retrieving trips for destination'] });
    }
  }
}
