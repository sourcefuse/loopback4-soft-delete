// DEVELOPMENT NOTE:
// Please ensure that any modifications made to this file are also applied to the following locations:
// 1) src/repositories/soft-crud.repository.base.ts
// 2) src/repositories/default-transaction-soft-crud.repository.base.ts

import {DefaultCrudRepository, Entity} from '@loopback/repository';

import {
  Constructor,
  IBaseEntity,
  ISoftCrudRepositoryMixin,
  MixinBaseClass,
} from '../types';
import {SoftCrudRepository} from '../repositories';
import {GodMixin} from '../decorators/soft-crud.decorator';

export function SoftCrudRepositoryMixin<
  E extends Entity & IBaseEntity,
  ID,
  T extends MixinBaseClass<DefaultCrudRepository<E, ID, R>>,
  R extends object = {},
>(base: T): T & Constructor<ISoftCrudRepositoryMixin<E, ID, R>> {
  @GodMixin(base, SoftCrudRepository)
  class SoftCrudRepositoryExtended extends base {}
  return SoftCrudRepositoryExtended as T &
    Constructor<ISoftCrudRepositoryMixin<E, ID, R>>;
}
