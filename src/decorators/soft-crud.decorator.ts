import {Condition, Filter, Options, Where} from '@loopback/repository';
import {SoftDeleteEntity} from '../models';
import {SoftCrudService} from '../services/soft-crud-service';

const whereParamMethods = ['updateAll', 'count'] as const;
type WhereParamMethod = (typeof whereParamMethods)[number];
const whereParamIndexes: Record<WhereParamMethod, number> = {
  updateAll: 1,
  count: 0,
};

export function GodMixin(...mixins: unknown & {prototype: unknown}[]) {
  return function (target: unknown & {prototype: unknown}) {
    mixins.forEach((mixin) => {
      Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
        Object.defineProperty(
          target.prototype,
          name,
          Object.getOwnPropertyDescriptor(mixin.prototype, name) ??
            Object.create(null),
        );
      });
    });
  };
}

/**
 * Ensure that where condition have `{ deleted: false }`
 * and Ensure `fields` filter contains 'deleted' column while quering
 * @param conditionToEnsure Overwrite the default condition i.e. `{ deleted: false }`
 * @returns Decorator to modify filter for function
 */
export function softFilter<T, E extends SoftDeleteEntity>(
  conditionToEnsure?: Condition<E>,
) {
  return function (_target: T, _key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (filter?: Filter<E>, options?: Options) {
      filter = filter ?? {};
      SoftCrudService.modifyWhereFilter(filter, conditionToEnsure);
      SoftCrudService.modifyFieldsFilter(filter);
      return originalMethod.apply(this, [filter, options]);
    };
    return descriptor;
  };
}

/**
 * Ensure that where condition have `{ deleted: false }`
 */
export function excludeSoftDeleted<T, E extends SoftDeleteEntity>(
  conditionToEnsure?: Condition<E>,
) {
  return function (_target: T, _key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName: WhereParamMethod = descriptor.value.name;

    descriptor.value = function (...args: Where<E>[]) {
      const whereIndex = whereParamIndexes[methodName];
      const filter = {where: args[whereIndex]};
      SoftCrudService.modifyWhereFilter(filter, conditionToEnsure);
      args[whereIndex] = filter.where;
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
