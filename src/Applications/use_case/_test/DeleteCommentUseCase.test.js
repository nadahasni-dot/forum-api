const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const UserRepository = require('../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockUserRepository.getUserById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      }));
    mockThreadRepository.verifyAvailableThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve({
        commentId: 'comment-123',
        userId: 'user-123',
        threadId: 'thread-123',
        content: 'lorem ipsum dolor sit amet',
        is_delete: false,
      }));
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(true));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const deletedComment = await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(deletedComment).toStrictEqual(true);

    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.userId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toBeCalledWith(useCasePayload.commentId);
    expect(mockThreadRepository.verifyAvailableThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(new DeleteComment(
      {
        commentId: useCasePayload.commentId,
        threadId: useCasePayload.threadId,
        userId: useCasePayload.userId,
      },
    ));
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(new DeleteComment(
      {
        commentId: useCasePayload.commentId,
        threadId: useCasePayload.threadId,
        userId: useCasePayload.userId,
      },
    ));
  });
});
