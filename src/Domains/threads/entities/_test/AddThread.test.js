const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
      body: 'abc',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 123,
      title: true,
      body: 'abc',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addThread object correctly', () => {
    // Arrange
    const payload = {
      userId: 'user-test',
      title: 'Thread Judul',
      body: 'lorem ipsum dolor sit amet',
    };

    // Action
    const { userId, title, body } = new AddThread(payload);

    // Assert
    expect(userId).toEqual(payload.userId);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
