const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'My new thread',
        body: 'lorem ipsum dolor sit amet',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: ['Dicoding Indonesia'],
        body: 'dicoding',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when provide invalid access token', async () => {
      // Arramge
      const requestPayload = {
        title: 'judul',
        body: 'dicoding',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
        url: '/threads',
        payload: {
          title: 'test',
          body: 'body',
        },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should return 200 with correct thread detail response', async () => {
      // ARRANGE
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        title: 'Thread baru',
        body: 'body thread',
        userId,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-test',
        userId,
        isDelete: true,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-test',
        userId,
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3',
        threadId: 'thread-test',
        userId,
        isDelete: false,
        content: 'Prikitiw',
      });

      const server = await createServer(container);

      // ACTION
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-test',
      });

      // ASSERT
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual('thread-test');
      expect(responseJson.data.thread.username).toEqual('dicoding');

      expect(responseJson.data.thread.comments).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].content).toEqual('Prikitiw');
      expect(responseJson.data.thread.comments[2].content).toEqual('**komentar telah dihapus**');
    });

    it('should return 404 when thread not found', async () => {
      // ARRANGE
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        title: 'Thread baru',
        body: 'body thread',
        userId,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-test',
        userId,
        isDelete: true,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-test',
        userId,
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3',
        threadId: 'thread-test',
        userId,
        isDelete: false,
        content: 'Prikitiw',
      });

      const server = await createServer(container);

      // ACTION
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-notfound',
      });

      // ASSERT
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
