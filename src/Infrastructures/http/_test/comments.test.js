const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

const pool = require('../../database/postgres/pool');

describe('/threads/{threadId}/comments endpoint', () => {
  let accessToken = '';
  let userId = '';

  beforeAll(async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };
    const server = await createServer(container);
    // add user
    const responseUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });
    const responseUserJson = JSON.parse(responseUser.payload);
    userId = responseUserJson.data.addedUser.id;

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });

    const responseJson = JSON.parse(response.payload);
    accessToken = responseJson.data.accessToken;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'lorem ipsum dolor sit amet',
      };
      const server = await createServer(container);

      // ADD dummy thread
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // ACTION
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 404 when thread data not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'lorem ipsum dolor sit amet',
      };
      const server = await createServer(container);

      // ACTION
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-qwerty/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menemukan data thread');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        unknown: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // ADD dummy thread
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['Dicoding Indonesia'],
      };
      const server = await createServer(container);

      // ADD dummy thread
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 401 when provide invalid access token', async () => {
      // Arramge
      const requestPayload = {
        content: 'lorem ipsum dolor sit amet',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: 'Bearer wrong-access-token',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 401 when no access token is provided', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'lorem ipsum dolor set amet',
        },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  // DELETE
  describe('/threads/{threadId}/comments/{commentId} endpoint', () => {
    describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
      it('should response 200 and delete comment', async () => {
        // Arrange
        const server = await createServer(container);
        await ThreadsTableTestHelper.addThread({
          id: 'thread-delete',
          title: 'Thread to be deleted',
          userId,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-delete',
          threadId: 'thread-delete',
          userId,
        });

        // ACTION
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-delete/comments/comment-delete',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });

      it('should response 404 when thread data not found', async () => {
        // Arrange
        const server = await createServer(container);
        await ThreadsTableTestHelper.addThread({
          id: 'thread-delete',
          title: 'Thread to be deleted',
          userId,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-delete',
          threadId: 'thread-delete',
          userId,
        });

        // ACTION
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-notfound/comments/comment-delete',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('tidak dapat menemukan data thread');
      });

      it('should response 404 when comment data not found', async () => {
        // Arrange
        const server = await createServer(container);
        await ThreadsTableTestHelper.addThread({
          id: 'thread-delete',
          title: 'Thread to be deleted',
          userId,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-delete',
          threadId: 'thread-delete',
          userId,
        });

        // ACTION
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-delete/comments/comment-notfound',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('tidak dapat menemukan data comment');
      });

      it('should response 403 when deleting non owned comment', async () => {
        // Arrange
        const server = await createServer(container);
        await ThreadsTableTestHelper.addThread({
          id: 'thread-delete',
          title: 'Thread to be deleted',
          userId: 'user-other',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-delete',
          threadId: 'thread-delete',
          userId: 'user-other',
        });

        // ACTION
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-delete/comments/comment-delete',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual('fail');
      });

      it('should response 401 when provide invalid access token', async () => {
        // Arramge
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-delete/comments/comment-delete',
          headers: {
            authorization: 'Bearer wrong-access-token',
          },
        });

        // Assert
        expect(response.statusCode).toEqual(401);
      });

      it('should response 401 when no access token is provided', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-delete/comments/comment-delete',
          payload: {
            content: 'lorem ipsum dolor set amet',
          },
        });

        expect(response.statusCode).toEqual(401);
      });
    });
  });
});
