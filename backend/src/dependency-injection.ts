import { App } from './app';
import { ENV } from './config/env.config';
import { DestinationController } from './controller/destination.controller';
import { HealthController } from './controller/health.controller';
import { PackingItemController } from './controller/packing-item.controller';
import { TripController } from './controller/trip.controller';
import { Database, db } from './database';
import { DestinationRepository } from './database/repository/destination.repository';
import { PackingItemRepository } from './database/repository/packing-item.repository';
import { TripRepository } from './database/repository/trip.repository';
import { TripToDestinationRepository } from './database/repository/trip-to-destination.repository';
import { Routes } from './routes/routes';
import { Server } from './server';

export const DI = {} as {
  app: App;
  db: Database;
  server: Server;
  routes: Routes;
  repositories: {
    trip: TripRepository;
    destination: DestinationRepository;
    tripToDestination: TripToDestinationRepository;
    packingItem: PackingItemRepository;
  };
  controllers: {
    health: HealthController;
    trip: TripController;
    destination: DestinationController;
    packingItem: PackingItemController;
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
    trip: new TripRepository(DI.db),
    destination: new DestinationRepository(DI.db),
    tripToDestination: new TripToDestinationRepository(DI.db),
    packingItem: new PackingItemRepository(DI.db),
  };

  // Initialize controllers
  DI.controllers = {
    health: new HealthController(),
    trip: new TripController(
      DI.repositories.trip,
      DI.repositories.tripToDestination,
    ),
    destination: new DestinationController(
      DI.repositories.destination,
      DI.repositories.tripToDestination,
    ),
    packingItem: new PackingItemController(
      DI.repositories.packingItem,
      DI.repositories.trip,
    ),
  };

  // Initialize routes
  DI.routes = new Routes(
    DI.controllers.health,
    DI.controllers.trip,
    DI.controllers.destination,
    DI.controllers.packingItem,
  );

  // Initialize app
  DI.app = new App(DI.routes);
  DI.server = new Server(DI.app, ENV);
}
