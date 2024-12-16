import {
  AnyObject,
  Count,
  Entity,
  Filter,
  Getter,
  Options,
  PropertyDefinition,
  Where,
} from '@loopback/repository';
import {ArchiveMapping} from './models';

export interface Constructor<T> {
  prototype: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T; // NOSONAR
}

export interface AbstractConstructor<T> {
  prototype: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T; // NOSONAR
}

export type MixinBaseClass<T> = Constructor<T> & AbstractConstructor<T>;

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
  countAll(where?: Where<E>, options?: Options): Promise<Count>;
}

export type ArchiveMixinBase<
  T extends Entity,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ID,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Relations,
> = MixinBaseClass<{
  entityClass: typeof Entity & {
    prototype: T;
  };
  deleteAll(where?: Where<T>, options?: ArchiveOption): Promise<Count>;
}>;

export interface IArchiveMixin {
  getCurrentUser?: () => Promise<User>;
  actorIdKey?: ActorId;
}

export interface User<ID = string, TID = string, UTID = string> {
  id?: string;
  username: string;
  password?: string;
  identifier?: ID;
  permissions: string[];
  authClientId: number;
  email?: string;
  role: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  tenantId?: TID;
  userTenantId?: UTID;
  passwordExpiryTime?: Date;
  allowedResources?: string[];
}

export type ActorId = Extract<keyof User, string>;
export interface ArchiveOption extends Options {
  skipArchive: boolean;
  actorId?: string;
}

export enum JobStatus {
  FAILED = 'Failed',
  IN_PROGRESS = 'In Progress',
  SUCCESS = 'Success',
}

export interface JobResponse {
  jobId: string;
  status?: JobStatus;
  message?: string;
}
export type ExportDataExternalSystem = (
  entriesToArchive: AnyObject[],
) => Promise<string>;

export type ImportDataExternalSystem = (
  fileName: string,
) => Promise<AnyObject[]>;

export type ProcessRetrievedData = (
  retrievedData: AnyObject[],
) => Promise<void>;

export const ArchivalDbSourceName = 'ArchivalDB';

export interface IBuildWhereConditionService {
  buildConditionForInsert(where: AnyObject | undefined): Promise<AnyObject>;
  buildConditionForFetch(
    filter: AnyObject,
    modelName: string,
  ): Promise<Filter<ArchiveMapping>>;
}

// export type SoftDeleteRepo<E extends Entity, ID, Repo extends object> =
//   | SoftCrudRepository<E, ID, Repo>
//   | DefaultTransactionSoftCrudRepository<E, ID, Repo>
//   | SequelizeSoftCrudRepository<E, ID, Repo>;
