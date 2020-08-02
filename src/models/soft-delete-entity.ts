import {Entity, property} from '@loopback/repository';

/**
 * Abstract base class for all soft-delete enabled models
 *
 * @description
 * Base class for all soft-delete enabled models created.
 * It adds three attributes to the model class for handling soft-delete,
 * namely, 'deleted', deletedOn, deletedBy
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
    type: 'string',
    name: 'deleted_by',
    jsonSchema: {
      nullable: true,
    },
  })
  deletedBy?: string;

  constructor(data?: Partial<SoftDeleteEntity>) {
    super(data);
  }
}
