import {
  Condition,
  DataObject,
  Entity,
  Filter,
  Getter,
  Where,
} from '@loopback/repository';

import {
  IBaseEntity,
  IUser,
  SoftCrudMixinAddons,
  SoftCrudMixinBase,
} from '../types';
import {Count, Options} from 'loopback-datasource-juggler';
import {SoftFilterBuilder} from '../utils/soft-filter-builder';
import {HttpErrors} from '@loopback/rest';
import {ErrorKeys} from '../error-keys';
import {cloneDeep} from 'lodash';

export function SoftCrudRepositoryMixin<
  E extends Entity & IBaseEntity,
  ID,
  R extends object,
  T extends SoftCrudMixinBase<E, ID, R>,
>(base: T & SoftCrudMixinBase<E, ID, R>) {
  abstract class SoftCrudRepositoryExtended extends base {
    getCurrentUser?: Getter<IUser | undefined>;
    find(filter?: Filter<E>, options?: Options): Promise<(E & R)[]> {
      const modifiedFilter = new SoftFilterBuilder(filter)
        .imposeCondition({
          deleted: false,
        } as Condition<E>)
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
        .limit(1)
        .build();

      const entity = await super.find(modifiedFilter, options);

      if (entity && entity.length > 0) {
        return entity[0];
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

    countAll(where?: Where<E>, options?: Options): Promise<Count> {
      return super.count(where, options);
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
  }
  return SoftCrudRepositoryExtended as typeof base &
    SoftCrudMixinAddons<E, ID, R>;
}
