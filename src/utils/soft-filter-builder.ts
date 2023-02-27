import {
  AndClause,
  Condition,
  Fields,
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
 *    .fields(["deleted"])
 *    .build();
 * ```
 */
export class SoftFilterBuilder<E extends SoftDeleteEntity> {
  filter: Filter<E>;

  constructor(originalFilter?: Filter<E>) {
    this.filter = originalFilter ?? {};
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

  fields(...f: (Fields<E> | Extract<keyof E, string>)[]) {
    this.filter.fields = new FilterBuilder(this.filter)
      .fields(...f)
      .build().fields;
    return this;
  }

  build() {
    return this.filter;
  }
}
