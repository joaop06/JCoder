import { TypeOrmQueryParser } from './typeorm-query.parser';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DecoratorOptions, ParsedFindManyOptions } from './types/parse-query.type';

export const ParseQuery = createParamDecorator(
  <Entity>(data: DecoratorOptions = {}, ctx: ExecutionContext): ParsedFindManyOptions<Entity> => {
    const request = ctx.switchToHttp().getRequest();
    const queryParams = request.query;

    const parser = new TypeOrmQueryParser(data);
    return parser.parse<Entity>(queryParams);
  },
);
