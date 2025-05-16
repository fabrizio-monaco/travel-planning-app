import { Request, Response } from 'express';
import MockDate from 'mockdate';
import { DestinationController } from '../src/controller/destination.controller';
import { DestinationRepository } from '../src/database/repository/destination.repository';
import { TripToDestinationRepository } from '../src/database/repository/trip-to-destination.repository';

/**
 * Unit test for the DestinationController class.
 *
 * This test demonstrates how to mock dependencies to isolate and test controller logic
 * that interacts with repositories.
 */
describe('DestinationController', () => {
  let destinationController: DestinationController;
  let mockDestinationRepository: jest.Mocked<DestinationRepository>;
  let mockTripToDestinationRepository: jest.Mocked<TripToDestinationRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    // Spy on console.error to prevent error messages from cluttering the test output
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
  });

  beforeEach(() => {
    // Create mock repositories
    mockDestinationRepository = jest.mocked({
      getAllDestinations: jest.fn(),
      getDestinationById: jest.fn(),
      createDestination: jest.fn(),
      updateDestination: jest.fn(),
      deleteDestination: jest.fn(),
    }) as unknown as jest.Mocked<DestinationRepository>;

    mockTripToDestinationRepository = jest.mocked({
      getTripsForDestination: jest.fn(),
      addDestinationToTrip: jest.fn(),
      updateTripDestination: jest.fn(),
      removeDestinationFromTrip: jest.fn(),
    }) as unknown as jest.Mocked<TripToDestinationRepository>;

    // Create controller instance with mock repositories
    destinationController = new DestinationController(
      mockDestinationRepository,
      mockTripToDestinationRepository,
    );

    // Setup mock request, response, and next
    mockRequest = {
      query: {},
      params: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getAllDestinations', () => {
    it('should return all destinations without relations when withRelations is false', async () => {
      // Arrange
      const mockDestinations = [
        {
          id: '1',
          name: 'Rome',
          description: 'Capital of Italy',
          createdAt: new Date(),
          updatedAt: new Date(),
          latitude: null,
          longitude: null,
            activities: null,
            photos: null,
        },
        {
          id: '2',
          name: 'Paris',
          description: 'Capital of France',
          createdAt: new Date(),
          updatedAt: new Date(),
          latitude: null,
          longitude: null,
            activities: null,
            photos: null,
        },
      ];

      mockRequest.query = { withRelations: 'false' };
      mockDestinationRepository.getAllDestinations.mockResolvedValue(mockDestinations);

      // Act
      await destinationController.getAllDestinations(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDestinationRepository.getAllDestinations).toHaveBeenCalledWith(false);
      expect(mockResponse.send).toHaveBeenCalledWith(mockDestinations);
    });

    it('should return all destinations with relations when withRelations is true', async () => {
      // Arrange
      const mockDestinationsWithRelations = [
        {
          id: '1',
          name: 'Rome',
          description: 'Capital of Italy',
          createdAt: new Date(),
          updatedAt: new Date(),
          latitude: null,
          longitude: null,
          activities: null,
          photos: null,
          tripToDestinations: [
            {
              tripId: 'trip1',
              destinationId: '1',
              startDate: '2023-06-01',
              endDate: '2023-06-07',
              trip: {
                id: 'trip1',
                name: 'Italy Trip',
              }
            }
          ]
        },
      ];

      mockRequest.query = { withRelations: 'true' };
      mockDestinationRepository.getAllDestinations.mockResolvedValue(mockDestinationsWithRelations);

      // Act
      await destinationController.getAllDestinations(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDestinationRepository.getAllDestinations).toHaveBeenCalledWith(true);
      expect(mockResponse.send).toHaveBeenCalledWith(mockDestinationsWithRelations);
    });

    it('should handle errors and return 500 status', async () => {
      // Arrange
      mockRequest.query = {};
      mockDestinationRepository.getAllDestinations.mockRejectedValue(new Error('Database error'));

      // Act
      await destinationController.getAllDestinations(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        errors: ['Error retrieving destinations'] 
      });
    });
  });

  describe('getDestinationById', () => {
    it('should return a destination when valid id is provided', async () => {
      // Arrange
      const mockDestination = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Tokyo',
        description: 'Capital of Japan',
        createdAt: new Date(),
        updatedAt: new Date(),
        latitude: null,
          longitude: null,
            activities: null,
            photos: null,
      };

      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      mockRequest.query = { withRelations: 'false' };
      mockDestinationRepository.getDestinationById.mockResolvedValue(mockDestination);

      // Act
      await destinationController.getDestinationById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDestinationRepository.getDestinationById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        false
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockDestination);
    });

    it('should return 404 status when destination is not found', async () => {
      // Arrange
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      mockRequest.query = {};
      mockDestinationRepository.getDestinationById.mockResolvedValue(undefined);

      // Act
      await destinationController.getDestinationById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        errors: ['Destination not found'] 
      });
    });

    it('should return 400 status when invalid UUID is provided', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-uuid' };
      mockRequest.query = {}; // Ensure query is defined

      // Act
      await destinationController.getDestinationById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: ['Invalid destination id format. Please provide a valid UUID.']
      });
      // The repository shouldn't be called when UUID validation fails
      expect(mockDestinationRepository.getDestinationById).not.toHaveBeenCalled();
    });
  });

  describe('createDestination', () => {
    it('should create and return a new destination with valid data', async () => {
      // Arrange
      const destinationData = {
        name: 'Berlin',
        description: 'Capital of Germany',
      };

      const createdDestination = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Berlin',
        description: 'Capital of Germany',
        createdAt: new Date(),
        updatedAt: new Date(),
        latitude: null,
          longitude: null,
            activities: null,
            photos: null,
      };

      mockRequest.body = destinationData;
      mockDestinationRepository.createDestination.mockResolvedValue(createdDestination);

      // Act
      await destinationController.createDestination(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(createdDestination);
    });

    it('should return 400 status with invalid destination data', async () => {
      // Arrange
      mockRequest.body = { description: 'Missing name' }; // name is required

      // Act
      await destinationController.createDestination(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        errors: ['Invalid destination data'] 
      });
    });
  });

  describe('getTripsForDestination', () => {
    it('should return trips for a valid destination id', async () => {
      // Arrange
      const mockTripRelations = [
        {
          tripId: 'trip1',
          destinationId: '550e8400-e29b-41d4-a716-446655440000',
          startDate: '2023-06-01',
          endDate: '2023-06-07',
          createdAt: new Date(),
          updatedAt: new Date(),
          trip: {
            id: 'trip1',
            name: 'Summer Vacation',
            startDate: '2023-06-01',
            endDate: '2023-06-15',
            description: null,
            budget: null,
            image: null,
            createdAt: null,
            updatedAt: null,
            participants: null
          }
        },
        {
          tripId: 'trip2',
          destinationId: '550e8400-e29b-41d4-a716-446655440000',
          startDate: '2023-12-20',
          endDate: '2023-12-28',
          createdAt: new Date(),
          updatedAt: new Date(),
          trip: {
            id: 'trip2',
            name: 'Winter Holiday',
            startDate: '2023-12-20',
            endDate: '2023-12-28',
            description: null,
            budget: null,
            image: null,
            createdAt: null,
            updatedAt: null,
            participants: null
          }
        }
      ];

      // The expected trips should match exactly what the controller returns
      const expectedTrips = [
        mockTripRelations[0].trip,
        mockTripRelations[1].trip
      ];

      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      mockTripToDestinationRepository.getTripsForDestination.mockResolvedValue(mockTripRelations);

      // Act
      await destinationController.getTripsForDestination(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockTripToDestinationRepository.getTripsForDestination).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(expectedTrips);
    });

    it('should return 400 status with invalid destination id', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-uuid' };

      // Act
      await destinationController.getTripsForDestination(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: ['Invalid destination id format. Please provide a valid UUID.']
      });
    });
  });
});
