const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
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
});
