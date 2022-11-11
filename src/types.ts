import {
  Count,
  Filter,
  Getter,
  Options,
  PropertyDefinition,
  Where,
} from '@loopback/repository';

// sonarignore:start
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractConstructor<T> = abstract new (...args: any[]) => T;
// sonarignore:end

export interface IUser {
  id?: number | string;
  [key: string]: unknown;
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

export interface ISoftCrudRepositoryMixin<E extends object, ID, R> {
  getCurrentUser: Getter<IUser | undefined>;
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
}
