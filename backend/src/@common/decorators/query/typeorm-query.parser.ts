import {
  FindOptionsOrder,
  FindOptionsWhere,
  FindOptionsSelect,
  FindOptionsRelations,
} from 'typeorm';
import {
  QueryParamValue,
  QueryParseOptions,
  ParsedFindManyOptions,
} from './types/parse-query.type';

export class TypeOrmQueryParser {
  private options: QueryParseOptions;

  constructor(options?: QueryParseOptions) {
    this.options = {
      sortParam: 'sort',
      pageParam: 'page',
      limitParam: 'limit',
      fieldsParam: 'fields',
      filterParam: 'filter',
      includeParam: 'include',
      ...options,
    };
  }

  parse<Entity>(queryParams: Record<string, QueryParamValue>): ParsedFindManyOptions<Entity> {
    const findManyOptions: ParsedFindManyOptions<Entity> = {};

    this.parseWhere(queryParams, findManyOptions);
    this.parseOrder(queryParams, findManyOptions);
    this.parseRelations(queryParams, findManyOptions);
    this.parseSelect(queryParams, findManyOptions);
    this.parsePagination(queryParams, findManyOptions);

    return findManyOptions;
  }

  private parseWhere<Entity>(queryParams: Record<string, QueryParamValue>, findManyOptions: ParsedFindManyOptions<Entity>): void {
    const filterQuery = queryParams[this.options.filterParam!];
    if (filterQuery && typeof filterQuery === 'string') {
      try {
        findManyOptions.where = JSON.parse(filterQuery) as FindOptionsWhere<Entity>;
      } catch (e) {
        console.error('Invalid JSON for where clause:', e);
      }
    }
  }

  private parseOrder<Entity>(queryParams: Record<string, QueryParamValue>, findManyOptions: ParsedFindManyOptions<Entity>): void {
    const sortQuery = queryParams[this.options.sortParam!];
    if (sortQuery && typeof sortQuery === 'string') {
      try {
        findManyOptions.order = JSON.parse(sortQuery) as FindOptionsOrder<Entity>;
      } catch (e) {
        console.error('Invalid JSON for order clause:', e);
      }
    }
  }

  private parseRelations<Entity>(queryParams: Record<string, QueryParamValue>, findManyOptions: ParsedFindManyOptions<Entity>): void {
    const includeQuery = queryParams[this.options.includeParam!];
    if (includeQuery && typeof includeQuery === 'string') {
      try {
        findManyOptions.relations = JSON.parse(includeQuery) as FindOptionsRelations<Entity>;
      } catch (e) {
        console.error('Invalid JSON for relations clause:', e);
      }
    }
  }

  private parseSelect<Entity>(queryParams: Record<string, QueryParamValue>, findManyOptions: ParsedFindManyOptions<Entity>): void {
    const fieldsQuery = queryParams[this.options.fieldsParam!];
    if (fieldsQuery && typeof fieldsQuery === 'string') {
      try {
        findManyOptions.select = JSON.parse(fieldsQuery) as FindOptionsSelect<Entity>;
      } catch (e) {
        console.error('Invalid JSON for select clause:', e);
      }
    }
  }

  private parsePagination<Entity>(queryParams: Record<string, QueryParamValue>, findManyOptions: ParsedFindManyOptions<Entity>): void {
    const page = queryParams[this.options.pageParam!];
    const limit = queryParams[this.options.limitParam!];

    if (limit && !isNaN(Number(limit))) {
      const take = Number(limit);
      findManyOptions.take = take;

      if (page && !isNaN(Number(page))) {
        const skip = (Number(page) - 1) * take;
        findManyOptions.skip = skip;
      }
    }
  }
};
