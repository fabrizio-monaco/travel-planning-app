import { Router } from 'express';

import { HealthController } from '../controller/health.controller';
import { TripController } from '../controller/trip.controller';
import { DestinationController } from '../controller/destination.controller';
import { PackingItemController } from '../controller/packing-item.controller';
import { FuelStationController } from '../controller/fuel-station.controller';

export class Routes {
  private router: Router;

  constructor(
    private readonly healthController: HealthController,
    private readonly tripController: TripController,
    private readonly destinationController: DestinationController,
    private readonly packingItemController: PackingItemController,
    private readonly fuelStationController: FuelStationController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Initializes the routes for the application.
   * ?.bind(this.authController.) ensures that 'this' inside the controller method refers to the controller instance rather than Express's context
   */
  private initializeRoutes(): void {
    // Health routes
    this.router.get(
      '/health',
      this.healthController.getHealthStatus.bind(this.healthController),
    ); // Trip routes - specific routes first
    this.router.get(
      '/trips/search',
      this.tripController.searchTrips.bind(this.tripController),
    );
    // Using kebab-case for REST API endpoints
    this.router.get(
      '/trips/by-destination/:destinationId',
      this.tripController.getTripsByDestination.bind(this.tripController),
    );

    // Trip generic routes
    this.router.get(
      '/trips',
      this.tripController.getAllTrips.bind(this.tripController),
    );
    this.router.post(
      '/trips',
      this.tripController.createTrip.bind(this.tripController),
    );
    this.router.get(
      '/trips/:id',
      this.tripController.getTripById.bind(this.tripController),
    );
    this.router.put(
      '/trips/:id',
      this.tripController.updateTrip.bind(this.tripController),
    );
    this.router.delete(
      '/trips/:id',
      this.tripController.deleteTrip.bind(this.tripController),
    );

    // Trip-Destination relationship routes
    this.router.post(
      '/trips/:tripId/destinations/:destinationId',
      this.tripController.addDestinationToTrip.bind(this.tripController),
    );
    this.router.put(
      '/trips/:tripId/destinations/:destinationId',
      this.tripController.updateTripDestination.bind(this.tripController),
    );
    this.router.delete(
      '/trips/:tripId/destinations/:destinationId',
      this.tripController.removeDestinationFromTrip.bind(this.tripController),
    );

    // Destination routes
    this.router.get(
      '/destinations',
      this.destinationController.getAllDestinations.bind(
        this.destinationController,
      ),
    );
    this.router.post(
      '/destinations',
      this.destinationController.createDestination.bind(
        this.destinationController,
      ),
    );
    this.router.get(
      '/destinations/:id',
      this.destinationController.getDestinationById.bind(
        this.destinationController,
      ),
    );
    this.router.put(
      '/destinations/:id',
      this.destinationController.updateDestination.bind(
        this.destinationController,
      ),
    );
    this.router.delete(
      '/destinations/:id',
      this.destinationController.deleteDestination.bind(
        this.destinationController,
      ),
    );
    this.router.get(
      '/destinations/:id/trips',
      this.destinationController.getTripsForDestination.bind(
        this.destinationController,
      ),
    );

    // Fuel Station routes
    this.router.get(
      '/destinations/:destinationId/fuel-stations',
      this.fuelStationController.getFuelStationsByDestination.bind(
        this.fuelStationController,
      ),
    );

    // Packing Item routes
    this.router.get(
      '/packing-items',
      this.packingItemController.getAllPackingItems.bind(
        this.packingItemController,
      ),
    );
    this.router.post(
      '/packing-items',
      this.packingItemController.createPackingItem.bind(
        this.packingItemController,
      ),
    );
    this.router.get(
      '/packing-items/:id',
      this.packingItemController.getPackingItemById.bind(
        this.packingItemController,
      ),
    );
    this.router.put(
      '/packing-items/:id',
      this.packingItemController.updatePackingItem.bind(
        this.packingItemController,
      ),
    );
    this.router.delete(
      '/packing-items/:id',
      this.packingItemController.deletePackingItem.bind(
        this.packingItemController,
      ),
    );

    // Trip-specific packing item routes
    this.router.get(
      '/trips/:tripId/packing-items',
      this.packingItemController.getPackingItemsByTripId.bind(
        this.packingItemController,
      ),
    );
    this.router.delete(
      '/trips/:tripId/packing-items',
      this.packingItemController.deletePackingItemsByTripId.bind(
        this.packingItemController,
      ),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
