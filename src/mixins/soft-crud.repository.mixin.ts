import {Constructor, Getter} from '@loopback/core';
import {
  AndClause,
  Condition,
  DataObject,
  DefaultCrudRepository,
  Entity,
  Filter,
  OrClause,
  Where,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {Options} from 'loopback-datasource-juggler';

import {ErrorKeys} from '../error-keys';
import {SoftDeleteEntity} from '../models';
import {
  AbstractConstructor,
  IBaseEntity,
  ISoftCrudRepositoryMixin,
  IUser,
} from '../types';

export function SoftCrudRepositoryMixin<
  E extends Entity & IBaseEntity,
  ID,
  T extends
    | Constructor<DefaultCrudRepository<E, ID, R>>
    | AbstractConstructor<DefaultCrudRepository<E, ID, R>>,
  R extends object = {},
>(base: T): T & Constructor<ISoftCrudRepositoryMixin<E, ID, R>> {
  class SoftCrudRepository
    extends base
    implements ISoftCrudRepositoryMixin<E, ID, R>
  {
    getCurrentUser: Getter<IUser | undefined>;
    deletedByIdKey = 'id';

    find(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
      // Filter out soft deleted entries
      if (
        filter?.where &&
        (filter.where as AndClause<E>).and &&
        (filter.where as AndClause<E>).and.length > 0
      ) {
        (filter.where as AndClause<E>).and.push({
          deleted: false,
        } as Condition<E>);
      } else if (
        filter?.where &&
        (filter.where as OrClause<E>).or &&
        (filter.where as OrClause<E>).or.length > 0
      ) {
        filter.where = {
          and: [
            {
              deleted: false,
            } as Condition<E>,
            {
              or: (filter.where as OrClause<E>).or,
            },
          ],
        };
      } else {
        filter = filter ?? {};
        filter.where = filter.where ?? {};
        (filter.where as Condition<E>).deleted = false;
      }

      // Now call super
      return super.find(filter, options);
    }

    findAll(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
      return super.find(filter, options);
    }

    findOne(filter?: Filter<E>, options?: Options): Promise<(E & R) | null> {
      // Filter out soft deleted entries
      if (
        filter?.where &&
        (filter.where as AndClause<E>).and &&
        (filter.where as AndClause<E>).and.length > 0
      ) {
        (filter.where as AndClause<E>).and.push({
          deleted: false,
        } as Condition<E>);
      } else if (
        filter?.where &&
        (filter.where as OrClause<E>).or &&
        (filter.where as OrClause<E>).or.length > 0
      ) {
        filter.where = {
          and: [
            {
              deleted: false,
            } as Condition<E>,
            {
              or: (filter.where as OrClause<E>).or,
            },
          ],
        };
      } else {
        filter = filter ?? {};
        filter.where = filter.where ?? {};
        (filter.where as Condition<E>).deleted = false;
      }

      // Now call super
      return super.findOne(filter, options);
    }

    //findOne() including soft deleted entry
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
      // Filter out soft deleted entries
      if (
        filter?.where &&
        (filter.where as AndClause<E>).and &&
        (filter.where as AndClause<E>).and.length > 0
      ) {
        (filter.where as AndClause<E>).and.push({
          deleted: false,
          id: id,
        } as Condition<E>);
      } else if (
        filter?.where &&
        (filter.where as OrClause<E>).or &&
        (filter.where as OrClause<E>).or.length > 0
      ) {
        filter.where = {
          and: [
            {
              deleted: false,
              id: id,
            } as Condition<E>,
            {
              or: (filter.where as OrClause<E>).or,
            },
          ],
        };
      } else {
        filter = filter ?? {};
        filter.where = {
          deleted: false,
          id: id,
        } as Condition<E>;
      }

      //As parent method findById have filter: FilterExcludingWhere<E>
      //so we need add check here.
      const entityToRemove = await super.findOne(filter, options);

      if (entityToRemove) {
        // Now call super
        return super.findById(id, filter, options);
      } else {
        throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
      }
    }

    //find by Id including soft deleted record
    async findByIdIncludeSoftDelete(
      id: ID,
      filter?: Filter<E>,
      options?: Options,
    ): Promise<E & R> {
      //As parent method findById have filter: FilterExcludingWhere<E>
      //so we need add check here.
      const entityToRemove = await super.findOne(filter, options);

      if (entityToRemove) {
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
      // Filter out soft deleted entries
      if (
        where &&
        (where as AndClause<E>).and &&
        (where as AndClause<E>).and.length > 0
      ) {
        (where as AndClause<E>).and.push({
          deleted: false,
        } as Condition<E>);
      } else if (
        where &&
        (where as OrClause<E>).or &&
        (where as OrClause<E>).or.length > 0
      ) {
        where = {
          and: [
            {
              deleted: false,
            } as Condition<E>,
            {
              or: (where as OrClause<E>).or,
            },
          ],
        };
      } else {
        where = where ?? {};
        (where as Condition<E>).deleted = false;
      }

      // Now call super
      return super.updateAll(data, where, options);
    }

    count(where?: Where<E>, options?: Options): Promise<Count> {
      // Filter out soft deleted entries
      if (
        where &&
        (where as AndClause<E>).and &&
        (where as AndClause<E>).and.length > 0
      ) {
        (where as AndClause<E>).and.push({
          deleted: false,
        } as Condition<E>);
      } else if (
        where &&
        (where as OrClause<E>).or &&
        (where as OrClause<E>).or.length > 0
      ) {
        where = {
          and: [
            {
              deleted: false,
            } as Condition<E>,
            {
              or: (where as OrClause<E>).or,
            },
          ],
        };
      } else {
        where = where ?? {};
        (where as Condition<E>).deleted = false;
      }

      // Now call super
      return super.count(where, options);
    }

    async delete(entity: E, options?: Options): Promise<void> {
      // Do soft delete, no hard delete allowed
      (entity as SoftDeleteEntity).deleted = true;
      (entity as SoftDeleteEntity).deletedOn = new Date();
      (entity as SoftDeleteEntity).deletedBy = await this.getUserId(
        this.getCurrentUser,
      );
      return super.update(entity, options);
    }

    async deleteAll(where?: Where<E>, options?: Options): Promise<Count> {
      // Do soft delete, no hard delete allowed
      return this.updateAll(
        {
          deleted: true,
          deletedOn: new Date(),
          deletedBy: await this.getUserId(this.getCurrentUser),
        } as DataObject<E>,
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
          deletedBy: await this.getUserId(this.getCurrentUser),
        } as DataObject<E>,
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
      return currentUser[this.deletedByIdKey] as string;
    }
  }
  return SoftCrudRepository;
}
