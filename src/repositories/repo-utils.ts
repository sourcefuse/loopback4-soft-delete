import {Filter, Where} from '@loopback/repository';
import {FilterBuilder, WhereBuilder} from '@loopback/filter';
import {SoftDeleteEntity} from '../models/soft-delete-entity';

/**
 * Returns a filter which filters out soft deleted entities.
 * @param {Filter<T>?} filter
 * @param {object} extras
 * @returns {Filter<T> | undefined}
 */
export function produceSoftDeleteFilter<T extends SoftDeleteEntity>(
  filter?: Filter<T>,
  extras: object = {},
): Filter<T> | undefined {
  let builder = new FilterBuilder();
  if (filter) {
    builder = builder.impose(filter);
  }
  builder = builder.impose({
    where: {
      and: [{deleted: false, ...extras}],
    },
  });
  filter = builder.build() as Filter<T>;
  return filter;
}

/**
 * Returns a where selector which filters out soft deleted entities.
 * @param {Filter<T>?} filter
 * @param {object} extras
 * @returns {Filter<T> | undefined}
 */
export function produceSoftDeleteWhere<T extends SoftDeleteEntity>(
  where?: Where<T>,
  extras: object = {},
): Where<T> | undefined {
  let builder = new WhereBuilder();
  if (where) {
    builder = builder.impose(where);
  }
  builder = builder.impose({
    and: [
      {
        deleted: false,
        ...extras,
      },
    ],
  });
  where = builder.build() as Where<T>;
  return where;
}
