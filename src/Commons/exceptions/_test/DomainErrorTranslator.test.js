const AuthorizationError = require('../AuthorizationError');
const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');
const NotFoundError = require('../NotFoundError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    // REGISTER USER
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));

    // THREAD
    expect(DomainErrorTranslator.translate(new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('VERIFY_THREAD.DATA_NOT_FOUND')))
      .toStrictEqual(new NotFoundError('tidak dapat menemukan data thread'));
    expect(DomainErrorTranslator.translate(new Error('GET_THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan thread karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('GET_THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan thread karena tipe data tidak sesuai'));

    // COMMENT
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat comment baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('VERIFY_COMMENT.DATA_NOT_FOUND')))
      .toStrictEqual(new NotFoundError('tidak dapat menemukan data comment'));
    expect(DomainErrorTranslator.translate(new Error('VERIFY_COMMENT.INVALID_OWNER')))
      .toStrictEqual(new AuthorizationError('anda tidak dapat mengakses comment ini'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
