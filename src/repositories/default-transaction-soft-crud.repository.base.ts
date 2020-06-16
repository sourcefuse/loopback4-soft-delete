import {
  AndClause,
  Condition,
  DataObject,
  Filter,
  juggler,
  OrClause,
  DefaultTransactionalRepository,
  Where,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {Options} from 'loopback-datasource-juggler';
import {SoftDeleteEntity} from '../models';

export abstract class DefaultTransactionSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {}
> extends DefaultTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof SoftDeleteEntity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
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
      (filter.where as AndClause<T>).and = [];
      (filter.where as AndClause<T>).and.push(
        {
          deleted: false,
        } as Condition<T>,
        {
          or: (filter.where as OrClause<T>).or,
        },
      );
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
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
      (filter.where as AndClause<T>).and = [];
      (filter.where as AndClause<T>).and.push(
        {
          deleted: false,
        } as Condition<T>,
        {
          or: (filter.where as OrClause<T>).or,
        },
      );
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.findOne(filter, options);
  }

  findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
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
      (filter.where as AndClause<T>).and = [];
      (filter.where as AndClause<T>).and.push(
        {
          deleted: false,
        } as Condition<T>,
        {
          or: (filter.where as OrClause<T>).or,
        },
      );
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.findById(id, filter, options);
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
      (where as AndClause<T>).and = [];
      (where as AndClause<T>).and.push(
        {
          deleted: false,
        } as Condition<T>,
        {
          or: (where as OrClause<T>).or,
        },
      );
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
      (where as AndClause<T>).and = [];
      (where as AndClause<T>).and.push(
        {
          deleted: false,
        } as Condition<T>,
        {
          or: (where as OrClause<T>).or,
        },
      );
    } else {
      where = where ?? {};
      (where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.count(where, options);
  }

  delete(entity: T, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    (entity as SoftDeleteEntity).deleted = true;
    return super.update(entity, options);
  }

  deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    // Do soft delete, no hard delete allowed
    return this.updateAll(
      {
        deleted: true,
      } as DataObject<T>,
      where,
      options,
    );
  }

  deleteById(id: ID, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    return super.updateById(
      id,
      {
        deleted: true,
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
}
