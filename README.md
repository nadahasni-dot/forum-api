Here is the updated README.md file with an explanation about migrate scripts:

# Forum API

A RESTful API for a forum application built using Node.js, Hapi, and PostgreSQL.

## Table of Contents

- [Forum API](#forum-api)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
  - [Testing](#testing)
  - [Migrations](#migrations)
  - [Contributing](#contributing)
  - [License](#license)

## Overview

This repository contains the source code for a forum API built using Node.js, Hapi, and PostgreSQL. The API provides endpoints for creating, reading, updating, and deleting threads, comments, and users.

## Features

- User authentication and authorization using JSON Web Tokens (JWT)
- Thread creation, retrieval, and deletion
- Comment creation, retrieval, and deletion
- User creation, retrieval, and deletion
- Support for PostgreSQL database

## Installation

To install the dependencies, run the following command:

```
npm install
```

This will install the required dependencies, including:

- `@hapi/hapi` for building the API
- `@hapi/jwt` for authentication and authorization
- `bcrypt` for password hashing
- `dotenv` for environment variable management
- `instances-container` for dependency injection
- `nanoid` for generating unique IDs
- `pg` for PostgreSQL database interactions
- `jest` for testing

## Usage

To start the server, run the following command:

```
npm start
```

The server will start on port 3000. You can use a tool like Postman or cURL to test the API endpoints.

## API Documentation

The API documentation is generated using Swagger and can be found at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Testing

To run the tests, run the following command:

```
npm test
```

The tests use Jest and cover the API endpoints, use cases, and repository implementations.

## Migrations

This repository uses `node-pg-migrate` to manage database migrations. The migration scripts are located in the `migrations` directory.

To run the migrations, use the following command:

```
npm run migrate up
```

This will apply all the migration scripts to the database.

To run the migrations for the test database, use the following command:

```
npm run migrate:test up
```

This will apply all the migration scripts to the test database.

The migration scripts are written in JavaScript and use the `pgm` object to interact with the database. Each migration script has an `up` function that applies the migration and a `down` function that reverts the migration.

For example, the `1746251620403_create-table-threads.js` migration script creates a `threads` table in the database:

```javascript
exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    body: {
      type: "TEXT",
      notNull: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });
};
```

## Contributing

Contributions are welcome! Please submit a pull request with your changes and a brief description of what you've changed.

## License

This repository is licensed under the ISC license.

Note: This is just an updated version, you can add or remove sections as per your requirement. Also, you can add more details to each section.

Please let me know if you want me to add anything else.
