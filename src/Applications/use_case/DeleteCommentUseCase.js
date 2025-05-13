const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ userRepository, threadRepository, commentRepository }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload);

    await this._userRepository.getUserById(deleteComment.userId);

    await this._commentRepository
      .verifyCommentAvailability(deleteComment.commentId);
    await this._threadRepository.verifyAvailableThreadById(deleteComment.threadId);

    await this._commentRepository.verifyCommentOwner(deleteComment);

    const result = await this._commentRepository.deleteCommentById(deleteComment);

    return result;
  }
}

module.exports = DeleteCommentUseCase;
