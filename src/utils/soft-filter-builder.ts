import {
  AndClause,
  Condition,
  Filter,
  FilterBuilder,
  OrClause,
} from '@loopback/repository';
import {SoftDeleteEntity} from '../models';

/**
 * A builder for soft crud filter.
 * Example
 *
 * ```ts
 * const filterBuilder = new SoftFilterBuilder(originalFilter)
 *    .imposeCondition({ deleted: false })
 *    .build();
 * ```
 */
export class SoftFilterBuilder<E extends SoftDeleteEntity> {
  filter: Filter<E>;

  constructor(originalFilter?: Filter<E>) {
    this.filter = originalFilter ?? {};
  }

  limit(limit: number) {
    this.filter.limit = new FilterBuilder(this.filter)
      .limit(limit)
      .build().limit;
    return this;
  }

  imposeCondition(conditionToEnsure: Condition<E>) {
    this.filter.where = this.filter.where ?? {};
    conditionToEnsure = conditionToEnsure ?? ({deleted: false} as Condition<E>);

    const hasAndClause = (this.filter.where as AndClause<E>).and?.length > 0;
    const hasOrClause = (this.filter.where as OrClause<E>).or?.length > 0;

    if (hasAndClause) {
      (this.filter.where as AndClause<E>).and.push(conditionToEnsure);
    }
    if (hasOrClause) {
      this.filter.where = {
        and: [
          conditionToEnsure,
          {
            or: (this.filter.where as OrClause<E>).or,
          },
        ],
      };
    }
    if (!(hasAndClause && hasOrClause)) {
      Object.assign(this.filter.where, conditionToEnsure);
    }
    return this;
  }

  build() {
    return this.filter;
  }
}
