// DEVELOPMENT NOTE:
// Please ensure that any modifications made to this file are also applied to the following locations:
// 1) src/repositories/default-transaction-soft-crud.repository.base.ts
// 2) src/mixins/soft-crud.repository.mixin.ts

import {Getter} from '@loopback/core';
import {
  AndClause,
  Condition,
  DataObject,
  DefaultCrudRepository,
  Entity,
  Filter,
  juggler,
  OrClause,
  Where,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {AnyObject, Options} from 'loopback-datasource-juggler';

import {ErrorKeys} from '../error-keys';
import {SoftDeleteEntity} from '../models';
import {IUser} from '../types';

export abstract class SoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
    protected readonly getCurrentUser?: Getter<IUser | undefined>,
  ) {
    super(entityClass, dataSource);
  }

  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
    // Filter out soft deleted entries
    if (
      filter?.where &&
      (filter.where as AndClause<T>).and &&
      (filter.where as AndClause<T>).and.length > 0
    ) {
      (filter.where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      filter?.where &&
      (filter.where as OrClause<T>).or &&
      (filter.where as OrClause<T>).or.length > 0
    ) {
      filter.where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (filter.where as OrClause<T>).or,
          },
        ],
      };
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.find(filter, options);
  }

  //find all enteries including soft deleted records
  findAll(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
    return super.find(filter, options);
  }

  findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    // Filter out soft deleted entries
    if (
      filter?.where &&
      (filter.where as AndClause<T>).and &&
      (filter.where as AndClause<T>).and.length > 0
    ) {
      (filter.where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      filter?.where &&
      (filter.where as OrClause<T>).or &&
      (filter.where as OrClause<T>).or.length > 0
    ) {
      filter.where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (filter.where as OrClause<T>).or,
          },
        ],
      };
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.findOne(filter, options);
  }

  //findOne() including soft deleted entry
  findOneIncludeSoftDelete(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    return super.findOne(filter, options);
  }

  //To find the primary key/Unique Id field name
  getPkFieldName() {
    const data = this.entityClass.definition.properties;
    let pk = 'id';
    for (const key in data) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (value.id) {
          pk = key;
          break;
        }
      }
    }
    return pk;
  }

  async findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    const pk = this.getPkFieldName();
    // Filter out soft deleted entries
    if (
      filter?.where &&
      (filter.where as AndClause<T>).and &&
      (filter.where as AndClause<T>).and.length > 0
    ) {
      (filter.where as AndClause<T>).and.push({
        deleted: false,
        [pk]: id,
      } as Condition<T>);
    } else if (
      filter?.where &&
      (filter.where as OrClause<T>).or &&
      (filter.where as OrClause<T>).or.length > 0
    ) {
      filter.where = {
        and: [
          {
            deleted: false,
            [pk]: id,
          } as Condition<T>,
          {
            or: (filter.where as OrClause<T>).or,
          },
        ],
      };
    } else {
      filter = filter ?? {};
      filter.where = {
        deleted: false,
        [pk]: id,
      } as Condition<T>;
    }
    let finalFilter: Filter<T> = {};
    //In case of array of fields, we need to copy the array
    // by value and not by reference
    finalFilter = {
      ...filter,
      fields:
        filter?.fields && Array.isArray(filter.fields)
          ? [...filter.fields]
          : filter.fields,
    };
    if (finalFilter.fields) {
      if (Array.isArray(finalFilter.fields)) {
        const fields = finalFilter.fields as Extract<
          keyof SoftDeleteEntity,
          string
        >[];
        if (!fields.includes('deleted')) {
          fields.push('deleted');
        }
      } else {
        finalFilter.fields = {
          ...finalFilter.fields,
          deleted: true,
        };
      }
    }
    const entity = await super.findById(id, finalFilter, options);
    if (entity && !entity.deleted) {
      if (filter.fields) {
        if (Array.isArray(filter.fields)) {
          const temp = filter.fields as Extract<
            keyof SoftDeleteEntity,
            string
          >[];
          if (!temp.includes('deleted')) {
            delete entity.deleted;
          }
        } else if (!(filter.fields as AnyObject).deleted) {
          delete entity.deleted;
        }
      }
      return entity;
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  //find by Id including soft deleted record
  async findByIdIncludeSoftDelete(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    const entity = await super.findById(id, filter, options);
    if (entity) {
      return entity;
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    // Filter out soft deleted entries
    if (
      where &&
      (where as AndClause<T>).and &&
      (where as AndClause<T>).and.length > 0
    ) {
      (where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      where &&
      (where as OrClause<T>).or &&
      (where as OrClause<T>).or.length > 0
    ) {
      where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (where as OrClause<T>).or,
          },
        ],
      };
    } else {
      where = where ?? {};
      (where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.updateAll(data, where, options);
  }

  count(where?: Where<T>, options?: Options): Promise<Count> {
    // Filter out soft deleted entries
    if (
      where &&
      (where as AndClause<T>).and &&
      (where as AndClause<T>).and.length > 0
    ) {
      (where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      where &&
      (where as OrClause<T>).or &&
      (where as OrClause<T>).or.length > 0
    ) {
      where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (where as OrClause<T>).or,
          },
        ],
      };
    } else {
      where = where ?? {};
      (where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.count(where, options);
  }

  async delete(entity: T, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    (entity as SoftDeleteEntity).deleted = true;
    (entity as SoftDeleteEntity).deletedOn = new Date();
    (entity as SoftDeleteEntity).deletedBy = await this.getUserId(options);
    return super.update(entity, options);
  }

  async deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    // Do soft delete, no hard delete allowed
    return this.updateAll(
      {
        deleted: true,
        deletedOn: new Date(),
        deletedBy: await this.getUserId(options),
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
        deletedBy: await this.getUserId(options),
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
    return super.deleteById(entity.getId(), options);
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
    if (!currentUser) {
      return undefined;
    }
    const userId = currentUser.getIdentifier?.() ?? currentUser.id;
    return userId?.toString();
  }
}
