class DeleteComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, userId, threadId } = payload;

    this.commentId = commentId;
    this.threadId = threadId;
    this.userId = userId;
  }

  _verifyPayload({ commentId, userId, threadId }) {
    if (!commentId || !userId || !threadId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof userId !== 'string' || typeof threadId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;
