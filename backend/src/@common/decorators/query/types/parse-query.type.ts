import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  FindOptionsSelect,
  FindOptionsRelations,
} from 'typeorm';

export type QueryParamValue = string | string[] | Record<string, any>;

export interface ParsedFindManyOptions<Entity> extends FindManyOptions<Entity> {
  skip?: number;
  take?: number;
  order?: FindOptionsOrder<Entity>;
  select?: FindOptionsSelect<Entity>;
  relations?: FindOptionsRelations<Entity>;
  where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[];
};

export interface QueryParseOptions {
  // Define how specific query parameters should be parsed
  // For example, 'filter' could map to 'where'
  // 'sort' could map to 'order'
  // 'include' could map to 'relations'
  // 'page' and 'limit' could map to 'skip' and 'take'
  // 'fields' could map to 'select'
  filterParam?: string; // Default 'filter'
  sortParam?: string;   // Default 'sort'
  includeParam?: string; // Default 'include'
  pageParam?: string;   // Default 'page'
  limitParam?: string;  // Default 'limit'
  fieldsParam?: string; // Default 'fields'
  // Add more options as needed for custom parsing behavior
};

export interface DecoratorOptions extends QueryParseOptions {
  // Options specific to the decorator itself, if any
  // For now, it extends QueryParseOptions
};
