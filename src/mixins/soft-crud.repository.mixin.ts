import {DefaultCrudRepository, Entity} from '@loopback/repository';

import {
  Constructor,
  IBaseEntity,
  ISoftCrudRepositoryMixin,
  MixinBaseClass,
} from '../types';
import {SoftCrudRepository} from '../repositories';
import extendPrototype from '../decorators/extend-prototype';

export function SoftCrudRepositoryMixin<
  E extends Entity & IBaseEntity,
  ID,
  T extends MixinBaseClass<DefaultCrudRepository<E, ID, R>>,
  R extends object = {},
>(base: T): T & Constructor<ISoftCrudRepositoryMixin<E, ID, R>> {
  // Using extendPrototype decorator here as Typescript doesn't support multilevel inheritance.
  // This will result in a class extending `base` class overridden with `SoftCrudRepository`'s methods and properties.
  @extendPrototype(SoftCrudRepository)
  class SoftCrudRepositoryExtended extends base {}
  return SoftCrudRepositoryExtended as T &
    Constructor<ISoftCrudRepositoryMixin<E, ID, R>>;
}
