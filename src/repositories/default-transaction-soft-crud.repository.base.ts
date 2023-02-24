// DEVELOPMENT NOTE:
// Please ensure that any modifications made to this file are also applied to the following locations:
// 1) src/repositories/soft-crud.repository.base.ts
// 2) src/mixins/soft-crud.repository.mixin.ts

import {
  Condition,
  DataObject,
  DefaultTransactionalRepository,
  Entity,
  Filter,
  Getter,
  juggler,
  Where,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {cloneDeep} from 'lodash';
import {Options} from 'loopback-datasource-juggler';
import {
  excludeSoftDeleted,
  softFilter,
} from '../decorators/soft-crud.decorator';
import {ErrorKeys} from '../error-keys';
import {SoftDeleteEntity} from '../models';
import {SoftCrudService} from '../services/soft-crud-service';
import {IUser} from '../types';

export abstract class DefaultTransactionSoftCrudRepository<
  E extends SoftDeleteEntity,
  ID,
  R extends object = {},
> extends DefaultTransactionalRepository<E, ID, R> {
  constructor(
    entityClass: typeof Entity & {
      prototype: E;
    },
    dataSource: juggler.DataSource,
    protected readonly getCurrentUser?: Getter<IUser | undefined>,
  ) {
    super(entityClass, dataSource);
  }

  @softFilter()
  find(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
    return super.find(filter, options);
  }

  findAll(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
    return super.find(filter, options);
  }

  @softFilter()
  findOne(filter?: Filter<E>, options?: Options): Promise<(E & R) | null> {
    return super.findOne(filter, options);
  }

  // findOne() including soft deleted entry
  findOneIncludeSoftDelete(
    filter?: Filter<E>,
    options?: Options,
  ): Promise<(E & R) | null> {
    return super.findOne(filter, options);
  }

  async findById(
    id: ID,
    filter?: Filter<E>,
    options?: Options,
  ): Promise<E & R> {
    const originalFilter = filter ?? {};
    const modifiedFilter = cloneDeep(originalFilter);

    const idProp = this.entityClass.getIdProperties()[0];

    // Ensure that where condition have `{ deleted: false }`
    SoftCrudService.modifyWhereFilter(modifiedFilter, {
      deleted: false,
      [idProp]: id,
    } as Condition<E>);

    // Ensure `fields` filter contains 'deleted' column while quering
    SoftCrudService.modifyFieldsFilter<E>(modifiedFilter);

    const entity = await super.findById(id, modifiedFilter, options);

    if (entity && !entity.deleted) {
      SoftCrudService.ensureDataCorrectness<E>(entity, originalFilter);
      return entity;
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  // findById (including soft deleted record)
  async findByIdIncludeSoftDelete(
    id: ID,
    filter?: Filter<E>,
    options?: Options,
  ): Promise<E & R> {
    //As parent method findById have filter: FilterExcludingWhere<E>
    //so we need add check here.
    const entity = await super.findOne(filter, options);

    if (entity) {
      // Now call super
      return super.findById(id, filter, options);
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  @excludeSoftDeleted()
  updateAll(
    data: DataObject<E>,
    where?: Where<E>,
    options?: Options,
  ): Promise<Count> {
    return super.updateAll(data, where, options);
  }

  @excludeSoftDeleted()
  count(where?: Where<E>, options?: Options): Promise<Count> {
    return super.count(where, options);
  }

  // soft delete
  async delete(entity: E, options?: Options): Promise<void> {
    const deletedBy = await this.getUserId(this.getCurrentUser);
    Object.assign(entity, SoftCrudService.softDeleteEntity(deletedBy));
    return super.update(entity, options);
  }

  async deleteAll(where?: Where<E>, options?: Options): Promise<Count> {
    const deletedBy = await this.getUserId(this.getCurrentUser);

    return super.updateAll(
      SoftCrudService.softDeleteEntity(deletedBy),
      where,
      options,
    );
  }

  // soft delete by id
  async deleteById(id: ID, options?: Options): Promise<void> {
    const deletedBy = await this.getUserId(this.getCurrentUser);
    return super.updateById(
      id,
      SoftCrudService.softDeleteEntity(deletedBy),
      options,
    );
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteHard(entity: E, options?: Options): Promise<void> {
    // Do hard delete
    return super.deleteById(entity.getId(), options);
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteAllHard(where?: Where<E>, options?: Options): Promise<Count> {
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
    if (!currentUser) {
      return undefined;
    }
    const userId = currentUser.getIdentifier?.() ?? currentUser.id;
    return userId?.toString();
  }
}
