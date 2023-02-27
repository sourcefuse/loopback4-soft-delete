/**
 * A Class decorator that takes in one or more classes and extends the prototype of a target class with the properties and methods from the provided classes.
 * @param classes One or more classes whose prototype will be extended onto the target class.
 */
export default function extendPrototype(
  ...classes: unknown & {prototype: unknown}[]
) {
  return function (target: unknown & {prototype: unknown}) {
    classes.forEach(mixin => {
      Object.getOwnPropertyNames(mixin.prototype).forEach(name => {
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
