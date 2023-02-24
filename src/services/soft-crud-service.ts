import {
  AndClause,
  Condition,
  DataObject,
  Filter,
  OrClause,
} from '@loopback/repository';
import {SoftDeleteEntity} from '../models';

export class SoftCrudService {
  /**
   * Ensures `{ deleted: false }` condition to be in filter.where
   * @param filter filter reference object that needs be altered to include `deleted: false` condition
   */
  static modifyWhereFilter<E extends SoftDeleteEntity>(
    filter: Filter<E>,
    conditionToEnsure?: Condition<E>,
  ) {
    filter.where = filter.where ?? {};

    conditionToEnsure = conditionToEnsure ?? ({deleted: false} as Condition<E>);

    const hasAndClause = (filter.where as AndClause<E>).and?.length > 0;
    const hasOrClause = (filter.where as OrClause<E>).or?.length > 0;

    if (hasAndClause) {
      (filter.where as AndClause<E>).and.push(conditionToEnsure);
    } else if (hasOrClause) {
      filter.where = {
        and: [
          conditionToEnsure,
          {
            or: (filter.where as OrClause<E>).or,
          },
        ],
      };
    } else {
      Object.assign(filter.where, conditionToEnsure);
    }
  }

  static modifyFieldsFilter<E extends SoftDeleteEntity>(filter: Filter<E>) {
    if (filter.fields) {
      if (Array.isArray(filter.fields)) {
        const fields = filter.fields as Extract<
          keyof SoftDeleteEntity,
          string
        >[];
        if (!fields.includes('deleted')) {
          fields.push('deleted');
        }
      } else {
        filter.fields = {
          ...filter.fields,
          deleted: true,
        };
      }
    }
  }

  static ensureDataCorrectness<E extends SoftDeleteEntity>(
    entity: E,
    originalFilter: Filter<E>,
  ) {
    // Strip out 'deleted' column if not requested in originalFilter
    if (!originalFilter.fields) {
      return;
    }
    if (Array.isArray(originalFilter.fields)) {
      const temp = originalFilter.fields as Extract<
        keyof SoftDeleteEntity,
        string
      >[];
      if (!temp.includes('deleted')) {
        delete entity.deleted;
      }
    } else {
      if (!originalFilter.fields.deleted) {
        delete entity.deleted;
      }
    }
  }

  static softDeleteEntity<E extends SoftDeleteEntity>(
    deletedBy: SoftDeleteEntity['deletedBy'],
  ): DataObject<E> {
    return {
      deleted: true,
      deletedOn: new Date(),
      deletedBy: deletedBy,
    };
  }
}
