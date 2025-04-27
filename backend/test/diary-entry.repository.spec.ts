import { TestDatabase } from './helpers/database';
import { UserTestHelper } from './helpers/user';
import { DiaryEntryRepository } from '../src/database/repository/diary-entry.repository';

/**
 * Integration tests for the DiaryEntryRepository class.
 * These tests verify the repository's interaction with the database.
 */
const TEST_IDS = {
  USER_1: '123e4567-e89b-12d3-a456-426614174000',
  USER_2: '123e4567-e89b-12d3-a456-426614174013',
  NON_EXISTENT_USER: '123e4567-e89b-12d3-a456-426614174011',
  NON_EXISTENT_ENTRY: '123e4567-e89b-12d3-a456-426614174010',
  TEST_ENTRY: '123e4567-e89b-12d3-a456-426614174014',
} as const;

describe('DiaryEntryRepository Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let repository: DiaryEntryRepository;
  let userHelper: UserTestHelper;

  beforeAll(async () => {
    await testDatabase.setup();
    repository = new DiaryEntryRepository(testDatabase.database);
    userHelper = new UserTestHelper(testDatabase.database);

    // Create fresh test users
    await userHelper.createUser({
      id: TEST_IDS.USER_1,
      email: 'user1@example.com',
      password: 'password1',
      firstName: 'User1',
      lastName: 'Test',
    });

    await userHelper.createUser({
      id: TEST_IDS.USER_2,
      email: 'user2@example.com',
      password: 'password2',
      firstName: 'User2',
      lastName: 'Test',
    });
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  describe('getDiaryEntryOfUserById', () => {
    it('should successfully retrieve a diary entry for an authorized user', async () => {
      // Arrange
      const testEntry = {
        userId: TEST_IDS.USER_1,
        title: 'Test Entry',
        content: 'Test Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const createdEntry = await repository.createDiaryEntryOfUser(
        TEST_IDS.USER_1,
        {
          title: testEntry.title,
          content: testEntry.content,
        },
      );

      // Act
      const result = await repository.getDiaryEntryOfUserById(
        createdEntry.id,
        TEST_IDS.USER_1,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdEntry.id);
      expect(result?.userId).toBe(TEST_IDS.USER_1);
      expect(result?.title).toBe(testEntry.title);
      expect(result?.content).toBe(testEntry.content);
    });

    it('should return undefined for non-existent diary entry', async () => {
      // Act
      const result = await repository.getDiaryEntryOfUserById(
        TEST_IDS.NON_EXISTENT_ENTRY,
        TEST_IDS.NON_EXISTENT_USER,
      );

      // Assert
      expect(result).toBeUndefined();
    });

    it("should return undefined when user attempts to access another user's entry", async () => {
      // Arrange
      const testEntry = {
        id: TEST_IDS.TEST_ENTRY,
        title: 'Test Entry',
        content: 'Test Content',
      };

      // Insert test data
      await repository.createDiaryEntryOfUser(TEST_IDS.USER_1, testEntry);

      // Act
      const result = await repository.getDiaryEntryOfUserById(
        TEST_IDS.TEST_ENTRY,
        TEST_IDS.USER_2,
      );

      // Assert
      expect(result).toBeUndefined();

      // Additional verification that entry exists for original user
      const originalUserResult = await repository.getDiaryEntryOfUserById(
        TEST_IDS.TEST_ENTRY,
        TEST_IDS.USER_1,
      );
      expect(originalUserResult).toBeDefined();
    });
  });
});
