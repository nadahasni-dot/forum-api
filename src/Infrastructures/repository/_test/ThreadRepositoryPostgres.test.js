const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        userId: 'user-123',
        title: 'Thread title',
        body: 'lorem ipsum dolor sit amet',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        userId: 'user-123',
        title: 'Thread title',
        body: 'lorem ipsum dolor sit',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Thread title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw InvariantError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-321'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return thread object correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-321',
        title: 'Thread title',
        body: 'lorem ipsum dolor sit amet',
        userId: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-321');

      // Assert
      expect(thread).toEqual({
        id: 'thread-321',
        title: 'Thread title',
        body: 'lorem ipsum dolor sit amet',
        user_id: 'user-123',
      });
    });
  });

  describe('verifyThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThreadById('thread-xxxx'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should resolve promise when thread found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-321',
        title: 'Thread title',
        body: 'lorem ipsum dolor sit amet',
        userId: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // action & assert
      expect(threadRepositoryPostgres.verifyAvailableThreadById('thread-321')).resolves.toEqual(true);
    });
  });
});
