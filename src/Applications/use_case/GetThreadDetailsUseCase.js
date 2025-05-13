const GetThreadDetails = require('../../Domains/threads/entities/GetThreadDetails');

class GetThreadDetailsUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = new GetThreadDetails(useCasePayload);

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
    }));

    thread.comments = formattedComments;

    return thread;
  }
}

module.exports = GetThreadDetailsUseCase;
