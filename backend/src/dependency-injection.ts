import { App } from './app';
import { ENV } from './config/env.config';
import { AuthController } from './controller/auth.controller';
import { DiaryEntryController } from './controller/diary-entry.controller';
import { HealthController } from './controller/health.controller';
import { TagController } from './controller/tag.controller';
import { Database, db } from './database';
import { DiaryEntryRepository } from './database/repository/diary-entry.repository';
import { TagRepository } from './database/repository/tag.repository';
import { UserRepository } from './database/repository/user.repository';
import { Routes } from './routes/routes';
import { Server } from './server';
import { Jwt } from './utils/jwt';
import { PasswordHasher } from './utils/password-hasher';

export const DI = {} as {
  app: App;
  db: Database;
  server: Server;
  routes: Routes;
  repositories: {
    diaryEntry: DiaryEntryRepository;
    user: UserRepository;
    tag: TagRepository;
  };
  controllers: {
    auth: AuthController;
    diaryEntry: DiaryEntryController;
    health: HealthController;
    tag: TagController;
  };
  utils: {
    passwordHasher: PasswordHasher;
    jwt: Jwt;
  };
};

export function initializeDependencyInjection() {
  // Initialize database
  DI.db = db;

  // Initialize utils
  DI.utils = {
    passwordHasher: new PasswordHasher(10),
    jwt: new Jwt(ENV.JWT_SECRET, {
      expiresIn: 3600, // in seconds
      issuer: 'http://fwe.auth',
    }),
  };

  // Initialize repositories
  DI.repositories = {
    diaryEntry: new DiaryEntryRepository(DI.db),
    user: new UserRepository(DI.db),
    tag: new TagRepository(DI.db),
  };

  // Initialize controllers
  DI.controllers = {
    auth: new AuthController(
      DI.repositories.user,
      DI.utils.passwordHasher,
      DI.utils.jwt,
    ),
    diaryEntry: new DiaryEntryController(
      DI.repositories.diaryEntry,
      DI.repositories.tag,
    ),
    health: new HealthController(),
    tag: new TagController(DI.repositories.tag),
  };

  // Initialize routes
  DI.routes = new Routes(
    DI.controllers.auth,
    DI.controllers.health,
    DI.controllers.tag,
    DI.controllers.diaryEntry,
  );

  // Initialize app
  DI.app = new App(DI.routes);
  DI.server = new Server(DI.app, ENV);
}
