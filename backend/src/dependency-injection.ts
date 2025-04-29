import { App } from './app';
import { ENV } from './config/env.config';
import { DiaryEntryController } from './controller/diary-entry.controller';
import { HealthController } from './controller/health.controller';
import { TagController } from './controller/tag.controller';
import { Database, db } from './database';
import { DiaryEntryRepository } from './database/repository/diary-entry.repository';
import { TagRepository } from './database/repository/tag.repository';
import { Routes } from './routes/routes';
import { Server } from './server';

export const DI = {} as {
  app: App;
  db: Database;
  server: Server;
  routes: Routes;
  repositories: {
    diaryEntry: DiaryEntryRepository;
    tag: TagRepository;
  };
  controllers: {
    diaryEntry: DiaryEntryController;
    health: HealthController;
    tag: TagController;
  };
  utils: {};
};

export function initializeDependencyInjection() {
  // Initialize database
  DI.db = db;

  // Initialize utils
  DI.utils = {};

  // Initialize repositories
  DI.repositories = {
    diaryEntry: new DiaryEntryRepository(DI.db),
    tag: new TagRepository(DI.db),
  };

  // Initialize controllers
  DI.controllers = {
    diaryEntry: new DiaryEntryController(
      DI.repositories.diaryEntry,
      DI.repositories.tag,
    ),
    health: new HealthController(),
    tag: new TagController(DI.repositories.tag),
  };

  // Initialize routes
  DI.routes = new Routes(
    DI.controllers.health,
    DI.controllers.tag,
    DI.controllers.diaryEntry,
  );

  // Initialize app
  DI.app = new App(DI.routes);
  DI.server = new Server(DI.app, ENV);
}
