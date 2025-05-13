const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread) {
    const { userId, title, body } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, body, user_id',
      values: [id, title, body, userId],
    };

    const result = await this._pool.query(query);
    const { id: savedId, title: savedTitle, user_id: savedUserId } = result.rows[0];

    return new AddedThread({ id: savedId, title: savedTitle, owner: savedUserId });
  }

  async getThreadById(threadId) {
    const query = {
      text: 'SELECT t.id, t.title, t.body, t.date, u.username FROM threads t JOIN users u ON t.user_id = u.id WHERE t.id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('GET_THREAD_DETAILS.DATA_NOT_FOUND');
    }

    const thread = result.rows[0];
    return thread;
  }

  async verifyAvailableThreadById(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('VERIFY_THREAD.DATA_NOT_FOUND');
    }

    return true;
  }
}

module.exports = ThreadRepositoryPostgres;
