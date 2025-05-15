const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetails = require('../../../Domains/threads/entities/GetThreadDetails');

describe('GetThreadDetailsUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread details action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    const mockTime = new Date();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'Thread baru',
        body: 'lorem ipsum dolor sit amet',
        date: mockTime,
        username: 'superman',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-1',
          username: 'batman',
          date: mockTime,
          content: 'Komentar 1',
          is_delete: false,
        },
        {
          id: 'comment-2',
          username: 'spiderman',
          date: mockTime,
          content: 'Komentar 2',
          is_delete: false,
        },
        {
          id: 'comment-3',
          username: 'wonderwoman',
          date: mockTime,
          content: 'Komentar 3',
          is_delete: true,
        },
      ]));

    /** creating use case instance */
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await getThreadDetailsUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toEqual({
      id: 'thread-123',
      title: 'Thread baru',
      body: 'lorem ipsum dolor sit amet',
      date: mockTime,
      username: 'superman',
      comments: [
        {
          id: 'comment-1',
          username: 'batman',
          date: mockTime,
          content: 'Komentar 1',
        },
        {
          id: 'comment-2',
          username: 'spiderman',
          date: mockTime,
          content: 'Komentar 2',
        },
        {
          id: 'comment-3',
          username: 'wonderwoman',
          date: mockTime,
          content: '**komentar telah dihapus**',
        },
      ],
    });

    expect(thread.comments).toHaveLength(3);

    expect(thread.comments[0]).toEqual({
      id: 'comment-1',
      username: 'batman',
      date: mockTime,
      content: 'Komentar 1',
    });

    expect(thread.comments[2]).toEqual({
      id: 'comment-3',
      username: 'wonderwoman',
      date: mockTime,
      content: '**komentar telah dihapus**',
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
