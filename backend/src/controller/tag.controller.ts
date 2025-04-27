import { Request, Response } from 'express';

import type { TagRepository } from '../database/repository/tag.repository';

export class TagController {
  constructor(private readonly tagRepository: TagRepository) {}

  async getTags(req: Request, res: Response): Promise<void> {
    const tags = await this.tagRepository.getTagsByUserId(req.user!.id);
    res.send(tags);
  }
}
