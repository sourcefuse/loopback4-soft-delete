import {Getter} from '@loopback/core';
import {
  AndClause,
  Condition,
  DataObject,
  DefaultCrudRepository,
  Entity,
  Filter,
  FilterBuilder,
  juggler,
  OrClause,
  Where,
  WhereBuilder,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {Options} from 'loopback-datasource-juggler';
import {IAuthUser} from 'loopback4-authentication';
import { SoftDeleteEntity } from 'loopback4-soft-delete';


export abstract class SoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
    protected readonly getCurrentUser?: Getter<IAuthUser | undefined>,
  ) {
    super(entityClass, dataSource);
  }

  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {

    let fb = new FilterBuilder<T>(filter)
    fb.impose({deleted:false} as Where<T>)

    // Now call super
    return super.find(fb.build(), options);
  }

  findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    let fb = new FilterBuilder<T>(filter)
    fb.impose({deleted:false} as Where<T>)

    // Now call super
    return super.findOne(fb.build(), options);
  }

  async findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    let fb = new FilterBuilder<T>(filter)
    fb.impose({and:[{deleted:false}, {id:id} ]} as Where<T>)

    //As parent method findById have filter: FilterExcludingWhere<T>
    //so we need add check here.
    const entityToRemove = await super.findOne(fb.build(), options);

    if (entityToRemove) {
      // Now call super
      return super.findById(id, fb.build(), options);
    } else {
      throw new HttpErrors.NotFound();
    }
  }

  updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    let wb = new WhereBuilder<T>(where)
    wb.impose({deleted:false} as Where<T>)

    // Now call super
    return super.updateAll(data, wb.build(), options);
  }

  count(where?: Where<T>, options?: Options): Promise<Count> {
    let wb = new WhereBuilder<T>(where)
    wb.impose({deleted:false} as Where<T>)

    // Now call super
    return super.count(wb.build(), options);
  }

  async delete(entity: T, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    (entity as SoftDeleteEntity).deleted = true;
    (entity as SoftDeleteEntity).deletedOn = new Date();
    (entity as SoftDeleteEntity).deletedBy = await this.getUserId();
    return super.update(entity, options);
  }

  async deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    // Do soft delete, no hard delete allowed
    return this.updateAll(
      {
        deleted: true,
        deletedOn: new Date(),
        deletedBy: await this.getUserId(),
      } as DataObject<T>,
      where,
      options,
    );
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    return super.updateById(
      id,
      {
        deleted: true,
        deletedOn: new Date(),
        deletedBy: await this.getUserId(),
      } as DataObject<T>,
      options,
    );
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteHard(entity: T, options?: Options): Promise<void> {
    // Do hard delete
    return super.delete(entity, options);
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteAllHard(where?: Where<T>, options?: Options): Promise<Count> {
    // Do hard delete
    return super.deleteAll(where, options);
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteByIdHard(id: ID, options?: Options): Promise<void> {
    // Do hard delete
    return super.deleteById(id, options);
  }

  private async getUserId(options?: Options): Promise<string | undefined> {
    if (!this.getCurrentUser) {
      return undefined;
    }
    let currentUser = await this.getCurrentUser();
    currentUser = currentUser ?? options?.currentUser;
    if (!currentUser || !currentUser.id) {
      return undefined;
    }
    return currentUser.id.toString();
  }
}
