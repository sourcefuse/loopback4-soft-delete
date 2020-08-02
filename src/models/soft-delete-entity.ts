import {Entity, property} from '@loopback/repository';

/**
 * Abstract base class for all soft-delete enabled models
 *
 * @description
 * Base class for all soft-delete enabled models created.
 * It adds a 'deleted' attribute to the model class for handling soft-delete.
 * Its an abstract class so no repository class should be based on this.
 */
export abstract class SoftDeleteEntity extends Entity {
  @property({
    type: 'boolean',
    default: false,
  })
  deleted?: boolean;

  @property({
    type: 'date',
    name: 'deleted_on',
    jsonSchema: {
      nullable: true,
    },
  })
  deletedOn?: Date;

  @property({
    type: 'number',
    name: 'deleted_by',
    jsonSchema: {
      nullable: true,
    },
  })
  deletedBy?: number;

  constructor(data?: Partial<SoftDeleteEntity>) {
    super(data);
  }
}
