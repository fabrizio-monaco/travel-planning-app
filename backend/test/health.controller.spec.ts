import { Request, Response } from 'express';
import { HealthController } from '../src/controller/health.controller';

/**
 * Unit test for the HealthController class.
 *
 * Typically, controllers are tested with integration tests rather than unit tests,
 * as integration tests are generally easier to write, understand, and better simulate real-world scenarios.
 * However, this example demonstrates how to mock dependencies to isolate and test controller logic.
 */
describe('HealthController', () => {
  let healthController: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create controller instance
    healthController = new HealthController();

    // Setup mock request and response
    mockRequest = {};
    mockResponse = {
      send: jest.fn(),
    };
  });

  describe('getHealthStatus', () => {
    it('should return the current date', async () => {
      // Act
      await healthController.getHealthStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.send).toHaveBeenCalled();
      const sentData = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sentData).toHaveProperty('date');
      expect(new Date(sentData.date)).toBeInstanceOf(Date);
    });
  });
});
