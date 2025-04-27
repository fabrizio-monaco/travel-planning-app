import { Request, Response } from 'express';
import { TagController } from '../src/controller/tag.controller';
import { TagRepository } from '../src/database/repository/tag.repository';

/**
 * Unit test for the TagController class.
 *
 * Typically, controllers are tested with integration tests rather than unit tests,
 * as integration tests are generally easier to write, understand, and better simulate real-world scenarios.
 * However, this example demonstrates how to mock dependencies to isolate and test controller logic
 * that interacts with external services.
 */
describe('TagController', () => {
  let tagController: TagController;
  let mockTagRepository: jest.Mocked<TagRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mock repository
    mockTagRepository = jest.mocked({
      getTagsByUserId: jest.fn(),
      createTagsForUser: jest.fn(),
      getTagsByNamesOrIds: jest.fn(),
    }) as unknown as jest.Mocked<TagRepository>;

    // Create controller instance with mock repository
    tagController = new TagController(mockTagRepository);

    // Setup mock request and response
    mockRequest = {
      user: {
        id: 'test-user-id',
        createdAt: null,
        updatedAt: null,
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      },
    };

    mockResponse = {
      send: jest.fn(),
    };
  });

  describe('getTags', () => {
    it('should return tags for the authenticated user', async () => {
      // Arrange
      const mockTags = [
        {
          id: '1',
          name: 'tag1',
          createdAt: null,
          updatedAt: null,
          userId: 'test-user-id',
        },
        {
          id: '2',
          name: 'tag2',
          createdAt: null,
          updatedAt: null,
          userId: 'test-user-id',
        },
      ];

      // Mock the repository method to return the mock tags
      mockTagRepository.getTagsByUserId.mockResolvedValue(mockTags);

      // Act
      await tagController.getTags(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockTagRepository.getTagsByUserId).toHaveBeenCalledWith(
        'test-user-id',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockTags);
    });
  });
});
