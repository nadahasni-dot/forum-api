const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      userId: 'abc',
      content: 'abc',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 123,
      threadId: true,
      content: 'abc',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addThread object correctly', () => {
    // Arrange
    const payload = {
      userId: 'user-test',
      threadId: 'thread-test',
      content: 'lorem ipsum dolor sit amet',
    };

    // Action
    const { userId, threadId, content } = new AddComment(payload);

    // Assert
    expect(userId).toEqual(payload.userId);
    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
  });
});
