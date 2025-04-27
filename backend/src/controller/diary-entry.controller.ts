import { Request, Response } from 'express';
import { z } from 'zod';

import { DiaryEntryRepository } from '../database/repository/diary-entry.repository';
import { TagRepository } from '../database/repository/tag.repository';
import {
  createDiaryEntryZodSchema,
  updateDiaryEntryZodSchema,
} from '../validation/validation';

export class DiaryEntryController {
  constructor(
    private readonly diaryEntryRepository: DiaryEntryRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  async getDiaryEntries(req: Request, res: Response): Promise<void> {
    const withRelations = z
      .boolean()
      .default(true)
      .parse(
        req.query.withRelations === 'true' ||
          req.query.withRelations === undefined,
      );

    const diaryEntries =
      await this.diaryEntryRepository.getDiaryEntriesByUserId(
        req.user!.id,
        withRelations,
      );
    res.send(diaryEntries);
  }

  async createDiaryEntry(req: Request, res: Response): Promise<void> {
    const validatedData = createDiaryEntryZodSchema.parse(req.body);

    const createdDiaryEntry =
      await this.diaryEntryRepository.createDiaryEntryOfUser(
        req.user!.id,
        validatedData,
      );

    // Separate tags with ids (existing) and tags with names (new)
    const tagsWithName = [];
    const tagsWithId = [];

    // Preparing tags for the database
    if (validatedData.tags) {
      for (const tag of validatedData.tags) {
        if (tag.id) {
          tagsWithId.push(tag.id);
        } else if (tag.name) {
          tagsWithName.push(tag.name);
        }
      }
    }

    // Create possibly new tags if there are any tags with only names
    if (tagsWithName.length > 0) {
      await this.tagRepository.createTagsForUser(
        req.user!.id,
        tagsWithName.map((t) => t),
      );
    }

    // Associate tags with the diary entry if there are any tags
    if (tagsWithId.length > 0) {
      // Get all tags with given names or ids to make sure we have all ids and they exist and are associated with the user
      const tags = await this.tagRepository.getTagsByNamesOrIds(
        tagsWithName,
        tagsWithId,
        req.user!.id,
      );
      await this.diaryEntryRepository.associateTagsWithDiaryEntry(
        createdDiaryEntry.id,
        tags.map((t) => t.id),
      );
    }

    const diaryEntryWithTags =
      await this.diaryEntryRepository.getDiaryEntriesByUserId(req.user!.id);

    res.status(201).send(diaryEntryWithTags);
  }

  async updateDiaryEntry(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const validatedId = z
      .string()
      .uuid({
        message: 'Invalid diaryEntry id format. Please provide a valid UUID.',
      })
      .parse(id);

    // Check if diary entry exists and belongs to user
    const existingDiaryEntry =
      await this.diaryEntryRepository.getDiaryEntryOfUserById(
        validatedId,
        req.user!.id,
      );
    if (!existingDiaryEntry) {
      res.status(404).json({ errors: ['Diary entry not found'] });
      return;
    }

    // Validate update data
    const validatedData = updateDiaryEntryZodSchema.parse(req.body);

    // Update the diary entry
    const updatedEntry = await this.diaryEntryRepository.updateDiaryEntryOfUser(
      validatedId,
      req.user!.id,
      validatedData,
    );

    res.send(updatedEntry);
  }

  async deleteDiaryEntry(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const validatedId = z
      .string()
      .uuid({
        message: 'Invalid diaryEntry id format. Please provide a valid UUID.',
      })
      .parse(id);

    const existingDiaryEntry =
      await this.diaryEntryRepository.getDiaryEntryOfUserById(
        validatedId,
        req.user!.id,
      );
    if (!existingDiaryEntry) {
      res.status(404).json({ errors: ['diaryEntry not found'] });
      return;
    }

    await this.diaryEntryRepository.deleteDiaryEntryOfUserById(
      id,
      req.user!.id,
    );
    res.status(204).send({});
  }
}
