const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        userId: 'user-123',
        threadId: 'thread-123',
        content: 'lorem ipsum dolor sit amet',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        userId: 'user-123',
        threadId: 'thread-123',
        content: 'lorem ipsum dolor sit',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'lorem ipsum dolor sit',
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentById function', () => {
    it('should throw InvariantError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById('comment-321'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return comment object correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-321');

      // Assert
      expect(comment).toEqual({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        user_id: 'user-123',
        thread_id: 'thread-123',
      });
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-321'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return comment object correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.verifyCommentAvailability('comment-321');

      // Assert
      expect(comment).toEqual({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        user_id: 'user-123',
        thread_id: 'thread-123',
      });
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment are not owned by user', async () => {
      // Arrange\
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const deleteComment = new DeleteComment({
        commentId: 'comment-321',
        threadId: 'thread-123',
        userId: 'user-xxx',
      });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(deleteComment))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should return comment object correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const deleteComment = new DeleteComment({
        commentId: 'comment-321',
        threadId: 'thread-123',
        userId: 'user-123',
      });

      // Action
      const comment = await commentRepositoryPostgres.verifyCommentOwner(deleteComment);

      // Assert
      expect(comment).toEqual({
        id: 'comment-321',
        content: 'lorem ipsum dolor sit amet',
        user_id: 'user-123',
        thread_id: 'thread-123',
      });
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when comment is empty', async () => {
      // ARRANGE
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-xxx',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-xxx',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3',
        threadId: 'thread-xxx',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // ACTION
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-walawe');

      // ASSERT
      expect(comments).toHaveLength(0);
      expect(comments).toEqual([]);
    });

    it('should return comments for related thread', async () => {
      // ARRANGE
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'billie' });
      const mockDateTime = new Date();
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'content-1',
        threadId: 'thread-xxx',
        userId: 'user-123',
        isDelete: true,
        date: mockDateTime,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'content-2',
        threadId: 'thread-xxx',
        userId: 'user-123',
        isDelete: false,
        date: mockDateTime,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3',
        content: 'content-3',
        threadId: 'thread-xxx',
        userId: 'user-123',
        isDelete: true,
        date: mockDateTime,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // ACTION
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-xxx');

      // ASSERT
      expect(comments).toHaveLength(3);
      expect(comments[0]).toEqual({
        id: 'comment-1',
        username: 'billie',
        date: mockDateTime,
        content: 'content-1',
        is_delete: true,
      });
      expect(comments[1]).toEqual({
        id: 'comment-2',
        username: 'billie',
        date: mockDateTime,
        content: 'content-2',
        is_delete: false,
      });
      expect(comments[2]).toEqual({
        id: 'comment-3',
        username: 'billie',
        date: mockDateTime,
        content: 'content-3',
        is_delete: true,
      });
    });
  });

  describe('deleteCommentById function', () => {
    it('should flag related comment to is_delete true', async () => {
      // ARRANGE
      const mockDateTime = new Date();
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'content-1',
        threadId: 'thread-xxx',
        userId: 'user-123',
        isDelete: false,
        date: mockDateTime,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // ACTION
      const result = await commentRepositoryPostgres.deleteCommentById({ commentId: 'comment-1' });

      // ASSERT
      expect(result).toEqual(1);

      const [updatedComment] = await CommentsTableTestHelper.findCommentById('comment-1');
      expect(updatedComment).toEqual({
        id: 'comment-1',
        thread_id: 'thread-xxx',
        user_id: 'user-123',
        content: 'content-1',
        is_delete: true,
        date: mockDateTime,
      });
    });

    it('should not flag as delete any comments if comment id not found', async () => {
      // ARRANGE
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // ACTION
      const result = await commentRepositoryPostgres.deleteCommentById({ commentId: 'comment-1' });

      // ASSERT
      expect(result).toEqual(0);
    });
  });
});
