import { Router } from 'express';

import { AuthController } from '../controller/auth.controller';
import { DiaryEntryController } from '../controller/diary-entry.controller';
import { HealthController } from '../controller/health.controller';
import { TagController } from '../controller/tag.controller';
import { verifyAccess } from '../middleware/auth.middleware';

export class Routes {
  private router: Router;

  constructor(
    private readonly authController: AuthController,
    private readonly healthController: HealthController,
    private readonly tagController: TagController,
    private readonly diaryEntryController: DiaryEntryController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Initializes the routes for the application.
   * ?.bind(this.authController.) ensures that 'this' inside the controller method refers to the controller instance rather than Express's context
   */
  private initializeRoutes(): void {
    // Auth routes
    this.router.post(
      '/auth/register',
      this.authController.registerUser.bind(this.authController),
    );
    this.router.post(
      '/auth/login',
      this.authController.loginUser.bind(this.authController),
    );

    // Health routes
    this.router.get(
      '/health',
      this.healthController.getHealthStatus.bind(this.healthController),
    );

    // Tag routes
    this.router.use('/tags', verifyAccess); // global protections for all tags routes
    this.router.get(
      '/tags',
      this.tagController.getTags.bind(this.tagController),
    );

    // DiaryEntry routes
    this.router.use('/diaryEntries', verifyAccess); // global protections for all diary-entries routes
    this.router.get(
      '/diaryEntries',
      this.diaryEntryController.getDiaryEntries.bind(this.diaryEntryController),
    );
    this.router.post(
      '/diaryEntries',
      this.diaryEntryController.createDiaryEntry.bind(
        this.diaryEntryController,
      ),
    );
    this.router.put(
      '/diaryEntries/:id',
      this.diaryEntryController.updateDiaryEntry.bind(
        this.diaryEntryController,
      ),
    );
    this.router.delete(
      '/diaryEntries/:id',
      this.diaryEntryController.deleteDiaryEntry.bind(
        this.diaryEntryController,
      ),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
