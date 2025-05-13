const GetThreadDetails = require('../GetThreadDetails');

describe('a GetThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };

    // Action and Assert
    expect(() => new GetThreadDetails(payload)).toThrowError('GET_THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 12,
    };

    // Action and Assert
    expect(() => new GetThreadDetails(payload)).toThrowError('GET_THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThreadDetails object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-xxx',
    };

    // Action
    const { threadId } = new GetThreadDetails(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
  });
});
