const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ userRepository, threadRepository, commentRepository }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    await this._userRepository.getUserById(addComment.userId);
    await this._threadRepository.verifyAvailableThreadById(addComment.threadId);
    return await this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
