// DEVELOPMENT NOTE:
// Please ensure that any modifications made to this file are also applied to the following locations:
// 1) src/repositories/default-transaction-soft-crud.repository.base.ts

import {Getter} from '@loopback/core';
import {
  DataObject,
  DefaultCrudRepository,
  Entity,
  Filter,
  juggler,
  Where,
  Fields,
  Condition,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {cloneDeep} from 'lodash';
import {Options} from 'loopback-datasource-juggler';

import {ErrorKeys} from '../error-keys';
import {SoftDeleteEntity} from '../models';
import {IUser} from '../types';
import {SoftFilterBuilder} from './../utils/soft-filter-builder';

export abstract class SoftCrudRepository<
  E extends SoftDeleteEntity,
  ID,
  R extends object = {},
> extends DefaultCrudRepository<E, ID, R> {
  constructor(
    entityClass: typeof Entity & {
      prototype: E;
    },
    dataSource: juggler.DataSource,
    protected readonly getCurrentUser?: Getter<IUser | undefined>,
  ) {
    super(entityClass, dataSource);
  }

  find(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
    const modifiedFilter = new SoftFilterBuilder(filter)
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .fields(filter?.fields ? (['deleted'] as Fields<E>) : [])
      .build();

    return super.find(modifiedFilter, options);
  }

  findAll(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
    return super.find(filter, options);
  }

  findOne(filter?: Filter<E>, options?: Options): Promise<(E & R) | null> {
    const modifiedFilter = new SoftFilterBuilder(filter)
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .fields(filter?.fields ? (['deleted'] as Fields<E>) : [])
      .build();

    return super.findOne(modifiedFilter, options);
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
    const idProp = this.entityClass.getIdProperties()[0];

    const modifiedFilter = new SoftFilterBuilder(cloneDeep(originalFilter))
      .imposeCondition({
        deleted: false,
        [idProp]: id,
      } as Condition<E>)
      .fields(originalFilter.fields ? (['deleted'] as Fields<E>) : [])
      .build();

    const entity = await super.findById(id, modifiedFilter, options);

    if (entity && !entity.deleted) {
      this.removeColumnIfNotRequested(entity, originalFilter);
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

  updateAll(
    data: DataObject<E>,
    where?: Where<E>,
    options?: Options,
  ): Promise<Count> {
    const filter = new SoftFilterBuilder({where})
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .build();

    return super.updateAll(data, filter.where, options);
  }

  count(where?: Where<E>, options?: Options): Promise<Count> {
    const filter = new SoftFilterBuilder({where})
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .build();
    return super.count(filter.where, options);
  }

  // soft delete
  async delete(entity: E, options?: Options): Promise<void> {
    return this.deleteById(entity.getId(), options);
  }

  async deleteAll(where?: Where<E>, options?: Options): Promise<Count> {
    const deletedBy = await this.getUserId(this.getCurrentUser);
    const dataToUpdate: DataObject<E> = {
      deleted: true,
      deletedOn: new Date(),
      deletedBy,
    };
    return super.updateAll(dataToUpdate, where, options);
  }

  // soft delete by id
  async deleteById(id: ID, options?: Options): Promise<void> {
    const deletedBy = await this.getUserId(this.getCurrentUser);
    return super.updateById(
      id,
      {
        deleted: true,
        deletedOn: new Date(),
        deletedBy,
      },
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
  /**
   * Strip out columns from entity if not requested in originalFilter
   * @param entity Data to modify
   * @param originalFilter Original Filter definition to validate keys with
   */
  private removeColumnIfNotRequested(
    entity: E,
    originalFilter: Filter<E>,
    columnsToRemove: Extract<keyof SoftDeleteEntity, string>[] = ['deleted'],
  ) {
    if (!originalFilter.fields) {
      return;
    }
    if (Array.isArray(originalFilter.fields)) {
      const fields = originalFilter.fields as Extract<
        keyof SoftDeleteEntity,
        string
      >[];
      for (const col of columnsToRemove) {
        if (!fields.includes(col)) {
          delete entity[col];
        }
      }
    } else {
      for (const col of columnsToRemove) {
        if (!originalFilter.fields[col]) {
          delete entity[col];
        }
      }
    }
  }
}
