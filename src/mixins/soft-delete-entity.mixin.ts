import {Constructor} from '@loopback/context';
import {Entity, property} from '@loopback/repository';
import {AbstractConstructor, IBaseEntity, IBaseEntityConfig} from '../types';

export function SoftDeleteEntityMixin<
  T extends Entity,
  S extends Constructor<T> | AbstractConstructor<T>,
>(base: S, config?: IBaseEntityConfig): typeof base & Constructor<IBaseEntity> {
  class SoftDeleteEntity extends base {
    @property({
      type: 'boolean',
      default: false,
      ...(config?.deleted ?? {}),
    })
    deleted?: boolean;

    @property({
      type: 'date',
      name: 'deleted_on',
      jsonSchema: {
        nullable: true,
      },
      ...(config?.deletedOn ?? {}),
    })
    deletedOn?: Date;

    @property({
      type: 'string',
      name: 'deleted_by',
      jsonSchema: {
        nullable: true,
      },
      ...(config?.deletedBy ?? {}),
    })
    deletedBy?: string;
  }

  return SoftDeleteEntity;
}
