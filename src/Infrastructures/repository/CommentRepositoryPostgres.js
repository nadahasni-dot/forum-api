const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { userId, threadId, content } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, user_id',
      values: [id, content, userId, threadId],
    };

    const result = await this._pool.query(query);
    const {
      id: savedId,
      content: savedContent,
      user_id: savedUserId,
    } = result.rows[0];

    return new AddedComment({
      id: savedId,
      content: savedContent,
      owner: savedUserId,
    });
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT id, content, user_id, thread_id FROM comments WHERE id = $1 AND is_delete = FALSE',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('comment tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id, content, user_id, thread_id FROM comments WHERE id = $1 AND is_delete IS NOT TRUE',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('VERIFY_COMMENT.DATA_NOT_FOUND');
    }

    return result.rows[0];
  }

  async verifyCommentOwner(deleteComment) {
    const { commentId, userId } = deleteComment;

    const query = {
      text: 'SELECT id, content, user_id, thread_id FROM comments WHERE id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('VERIFY_COMMENT.INVALID_OWNER');
    }

    return result.rows[0];
  }

  async deleteCommentById(deleteComment) {
    const { commentId } = deleteComment;

    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT c.id, u.username, c.date, c.content, c.is_delete FROM comments c JOIN users u ON c.user_id = u.id WHERE c.thread_id = $1 ORDER BY c.date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
