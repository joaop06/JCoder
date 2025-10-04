'''
# Decorator @ParseQuery para NestJS

Este decorator simplifica a conversão de query parameters de uma requisição HTTP para o objeto `FindManyOptions` do TypeORM, facilitando a implementação de listagens paginadas, com filtros, ordenação e seleção de campos em APIs NestJS.

## Estrutura de Arquivos

```
src/
├── @common
    ├── types
        ├── parse-query.type.ts      # As definições de tipos
    ├── parse-query.decorator.ts  # O decorator principal
    ├── typeorm-query.parser.ts     # A lógica de conversão
```

## Instalação

Copie os três arquivos (`parse-query.decorator.ts`, `typeorm-query.parser.ts`, `parse-query.type.ts`) para um diretório em seu projeto NestJS, por exemplo, `src/decorators`.

## Como Usar

Importe o decorator `@ParseQuery` em sua controller e utilize-o em um método que realiza a busca de dados. O decorator irá injetar o objeto `FindManyOptions` diretamente no método.

### Exemplo Básico

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

Neste exemplo, o método `findAll` da controller receberá um objeto `options` pronto para ser passado para o método `find()` do repositório do TypeORM.

## Parâmetros de Query Suportados

O decorator, por padrão, reconhece os seguintes parâmetros na URL:

| Parâmetro | Descrição                                                                                             | Exemplo de URL                                                                                             |
| :---------- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `limit`     | Define o número de registros por página (`take`).                                                     | `?limit=10`                                                                                                |
| `page`      | Define a página atual, que é convertida para `skip`.                                                  | `?limit=10&page=2` (resultará em `skip: 10`)                                                               |
| `filter`    | Aplica condições de filtro (`where`). O valor deve ser um JSON stringificado.                         | `?filter={"name": "John Doe"}`                                                                             |
| `sort`      | Define a ordenação dos resultados (`order`). O valor deve ser um JSON stringificado.                  | `?sort={"createdAt": "DESC"}`                                                                              |
| `fields`    | Seleciona campos específicos para retornar (`select`). O valor deve ser um JSON stringificado.        | `?fields=["id", "name", "email"]`                                                                          |
| `include`   | Define as relações a serem incluídas na consulta (`relations`). O valor deve ser um JSON stringificado. | `?include=["posts", "profile"]`                                                                            |

**Nota:** Para os parâmetros `filter`, `sort`, `fields` e `include`, os valores na URL devem ser JSON strings devidamente codificadas (URL-encoded).

### Exemplo de Requisição Completa

Uma requisição para buscar usuários com o nome "John", na segunda página, com 10 itens por página, ordenados por data de criação decrescente e incluindo seus posts seria:

```
GET /users?limit=10&page=2&filter={"name":"John"}&sort={"createdAt":"DESC"}&include=["posts"]
```

O decorator converterá essa query para o seguinte objeto `FindManyOptions`:

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

## Customizando os Nomes dos Parâmetros

É possível customizar os nomes dos parâmetros de query passando um objeto de configuração para o decorator.

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

Com essa configuração, a URL da requisição seria:

```
GET /users?perPage=10&p=2&q={"name":"John"}&orderBy={"createdAt":"DESC"}
```
'''
