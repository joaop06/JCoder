'''
# @ParseQuery Decorator for NestJS

This decorator simplifies the conversion of HTTP request query parameters to TypeORM's `FindManyOptions` object, facilitating the implementation of paginated listings with filters, sorting, and field selection in NestJS APIs.

## File Structure

```
src/
├── @common
    ├── types
        ├── parse-query.type.ts      # Type definitions
    ├── parse-query.decorator.ts  # Main decorator
    ├── typeorm-query.parser.ts     # Conversion logic
```

## Installation

Copy the three files (`parse-query.decorator.ts`, `typeorm-query.parser.ts`, `parse-query.type.ts`) to a directory in your NestJS project, for example, `src/decorators`.

## How to Use

Import the `@ParseQuery` decorator in your controller and use it in a method that performs data searches. The decorator will inject the `FindManyOptions` object directly into the method.

### Basic Example

```typescript
// src/applications/applications.controller.ts
import {
  Get,
  Controller,
} from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) { }

  @Get()
  async findAll(@ParseQuery() options: FindManyOptions<Application>) {
    return await this.applicationsService.findAll(options);
  }
}
```

In this example, the controller's `findAll` method will receive an `options` object ready to be passed to TypeORM repository's `find()` method.

## Supported Query Parameters

The decorator, by default, recognizes the following URL parameters:

| Parameter | Description                                                                                           | URL Example                                                                                             |
| :---------- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `limit`     | Defines the number of records per page (`take`).                                                     | `?limit=10`                                                                                                |
| `page`      | Defines the current page, which is converted to `skip`.                                                  | `?limit=10&page=2` (will result in `skip: 10`)                                                               |
| `filter`    | Applies filter conditions (`where`). Value must be a stringified JSON.                         | `?filter={"name": "John Doe"}`                                                                             |
| `sort`      | Defines result ordering (`order`). Value must be a stringified JSON.                  | `?sort={"createdAt": "DESC"}`                                                                              |
| `fields`    | Selects specific fields to return (`select`). Value must be a stringified JSON.        | `?fields=["id", "name", "email"]`                                                                          |
| `include`   | Defines relations to be included in the query (`relations`). Value must be a stringified JSON. | `?include=["posts", "profile"]`                                                                            |

**Note:** For the `filter`, `sort`, `fields`, and `include` parameters, the values in the URL must be properly encoded JSON strings (URL-encoded).

### Complete Request Example

A request to fetch users with the name "John", on the second page, with 10 items per page, ordered by descending creation date and including their posts would be:

```
GET /users?limit=10&page=2&filter={"name":"John"}&sort={"createdAt":"DESC"}&include=["posts"]
```

The decorator will convert this query to the following `FindManyOptions` object:

```json
{
  "take": 10,
  "skip": 10,
  "where": {
    "name": "John"
  },
  "order": {
    "createdAt": "DESC"
  },
  "relations": [
    "posts"
  ]
}
```

## Customizing Parameter Names

It's possible to customize the query parameter names by passing a configuration object to the decorator.

```typescript
// src/users/users.controller.ts
import { FindManyOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Controller, Get } from '@nestjs/common';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @ParseQuery({
      limitParam: 'perPage',
      pageParam: 'p',
      filterParam: 'q',
      sortParam: 'orderBy'
    }) options: FindManyOptions<User>
  ) {
    return this.usersService.findAll(options);
  }
}
```

With this configuration, the request URL would be:

```
GET /users?perPage=10&p=2&q={"name":"John"}&orderBy={"createdAt":"DESC"}
```
'''
