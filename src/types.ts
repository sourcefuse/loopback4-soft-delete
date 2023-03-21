import {
  Count,
  DataObject,
  Entity,
  Filter,
  FilterExcludingWhere,
  Options,
  PropertyDefinition,
  Where,
} from '@loopback/repository';

export interface Constructor<T> {
  prototype: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T; // NOSONAR
}

// sonarignore:start
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractConstructor<T> = abstract new (...args: any[]) => T; // NOSONAR

export type MixinBaseClass<T> = AbstractConstructor<T>;

export interface IUser {
  id?: number | string;
  getIdentifier?(): number | string | undefined;
}

export interface IBaseEntityConfig {
  deleted?: Partial<PropertyDefinition>;
  deletedOn?: Partial<PropertyDefinition>;
  deletedBy?: Partial<PropertyDefinition>;
}

export interface IBaseEntity {
  deleted?: boolean;
  deletedOn?: Date;
  deletedBy?: string;
}

export type SoftCrudMixinAddons<E extends object, ID, R> = MixinBaseClass<{
  findAll(filter?: Filter<E>, options?: Options): Promise<(E & R)[]>;
  deleteHard(entity: E, options?: Options): Promise<void>;
  deleteByIdHard(id: ID, options?: Options): Promise<void>;
  findByIdIncludeSoftDelete(
    id: ID,
    filter?: Filter<E>,
    options?: Options,
  ): Promise<E & R>;
  deleteAllHard(where?: Where<E>, options?: Options): Promise<Count>;
  findOneIncludeSoftDelete(
    filter?: Filter<E>,
    options?: Options,
  ): Promise<(E & R) | null>;
  findById(id: ID, filter?: Filter<E>, options?: Options): Promise<E & R>;
  countAll(where?: Where<E>, options?: Options): Promise<Count>;
}>;

export type SoftCrudMixinBase<
  T extends Entity,
  ID,
  Relations,
> = MixinBaseClass<{
  entityClass: typeof Entity & {
    prototype: T;
  };
  count(where?: Where<T>, options?: Options): Promise<Count>;
  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;
  findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null>;
  findById(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T & Relations>;
  updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count>;
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
  deleteById(id: ID, options?: Options): Promise<void>;
  deleteAll(where?: Where<T>, options?: Options): Promise<Count>;
}>;
