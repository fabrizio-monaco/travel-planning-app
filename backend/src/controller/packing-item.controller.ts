import { Request, Response } from 'express';
import { z } from 'zod';
import { PackingItemRepository } from '../database/repository/packing-item.repository';
import { TripRepository } from '../database/repository/trip.repository';
import {
  createPackingItemZodSchema,
  updatePackingItemZodSchema,
} from '../validation/validation';

export class PackingItemController {
  constructor(
    private readonly packingItemRepository: PackingItemRepository,
    private readonly tripRepository: TripRepository,
  ) {}

  async getAllPackingItems(req: Request, res: Response): Promise<void> {
    try {
      const packingItems =
        await this.packingItemRepository.getAllPackingItems();
      res.send(packingItems);
    } catch (error) {
      console.error('Error retrieving packing items:', error);
      res.status(500).json({ errors: ['Error retrieving packing items'] });
    }
  }

  async getPackingItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid packing item id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid packing item id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      const packingItem = await this.packingItemRepository.getPackingItemById(
        validatedId.data,
      );

      if (!packingItem) {
        res.status(404).json({ errors: ['Packing item not found'] });
        return;
      }

      res.send(packingItem);
    } catch (error) {
      console.error('Error retrieving packing item:', error);
      res.status(500).json({ errors: ['Error retrieving packing item'] });
    }
  }

  async getPackingItemsByTripId(req: Request, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(tripId);

      if (!validatedId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      // Verify that trip exists
      const trip = await this.tripRepository.getTripById(validatedId.data);
      if (!trip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      const packingItems =
        await this.packingItemRepository.getPackingItemsByTripId(
          validatedId.data,
        );
      res.send(packingItems);
    } catch (error) {
      console.error('Error retrieving packing items for trip:', error);
      res.status(500).json({ errors: ['Error retrieving packing items'] });
    }
  }

  async createPackingItem(req: Request, res: Response): Promise<void> {
    try {
      const validation = createPackingItemZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          errors: validation.error.errors.map((e) => e.message),
        });
        return;
      }

      // Verify that trip exists
      const trip = await this.tripRepository.getTripById(
        validation.data.tripId,
      );
      if (!trip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      const packingItem = await this.packingItemRepository.createPackingItem(
        validation.data,
      );
      res.status(201).send(packingItem);
    } catch (error) {
      console.error('Error creating packing item:', error);
      res.status(500).json({ errors: ['Error creating packing item'] });
    }
  }

  async updatePackingItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid packing item id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid packing item id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      // Check if packing item exists
      const existingItem = await this.packingItemRepository.getPackingItemById(
        validatedId.data,
      );
      if (!existingItem) {
        res.status(404).json({ errors: ['Packing item not found'] });
        return;
      }

      // Validate update data
      const validation = updatePackingItemZodSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          errors: validation.error.errors.map((e) => e.message),
        });
        return;
      }

      // If tripId is provided, verify that trip exists
      if (validation.data.tripId) {
        const trip = await this.tripRepository.getTripById(
          validation.data.tripId,
        );
        if (!trip) {
          res.status(404).json({ errors: ['Trip not found'] });
          return;
        }
      }

      const updatedItem = await this.packingItemRepository.updatePackingItem(
        validatedId.data,
        validation.data,
      );
      res.send(updatedItem);
    } catch (error) {
      console.error('Error updating packing item:', error);
      res.status(500).json({ errors: ['Error updating packing item'] });
    }
  }

  async deletePackingItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message:
            'Invalid packing item id format. Please provide a valid UUID.',
        })
        .safeParse(id);

      if (!validatedId.success) {
        res.status(400).json({
          errors: [
            'Invalid packing item id format. Please provide a valid UUID.',
          ],
        });
        return;
      }

      // Check if packing item exists
      const existingItem = await this.packingItemRepository.getPackingItemById(
        validatedId.data,
      );
      if (!existingItem) {
        res.status(404).json({ errors: ['Packing item not found'] });
        return;
      }

      await this.packingItemRepository.deletePackingItem(validatedId.data);
      res.status(204).send({});
    } catch (error) {
      console.error('Error deleting packing item:', error);
      res.status(500).json({ errors: ['Error deleting packing item'] });
    }
  }

  async deletePackingItemsByTripId(req: Request, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const validatedId = z
        .string()
        .uuid({
          message: 'Invalid trip id format. Please provide a valid UUID.',
        })
        .safeParse(tripId);

      if (!validatedId.success) {
        res.status(400).json({
          errors: ['Invalid trip id format. Please provide a valid UUID.'],
        });
        return;
      }

      // Verify that trip exists
      const trip = await this.tripRepository.getTripById(validatedId.data);
      if (!trip) {
        res.status(404).json({ errors: ['Trip not found'] });
        return;
      }

      await this.packingItemRepository.deletePackingItemsByTripId(
        validatedId.data,
      );
      res.status(204).send({});
    } catch (error) {
      console.error('Error deleting packing items for trip:', error);
      res.status(500).json({ errors: ['Error deleting packing items'] });
    }
  }
}
