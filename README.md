# loopback4-soft-delete

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

[![Node version](https://img.shields.io/node/v/loopback4-soft-delete.svg?style=flat-square)](https://nodejs.org/en/download/)
[![Loopback Core Version](https://img.shields.io/npm/dependency-version/loopback4-soft-delete/@loopback/core?style=flat-square)](https://github.com/strongloop/loopback-next)
[![Loopback Build Version](https://img.shields.io/npm/dependency-version/loopback4-soft-delete/dev/@loopback/build.svg?color=dark%20green&style=flat-square)](https://github.com/strongloop/loopback-next/tree/master/packages/build)
[![npm vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/loopback4-soft-delete.svg?style=flat-square)](https://www.npmjs.com/package/loopback4-soft-delete)

[![Latest version](https://img.shields.io/npm/v/loopback4-soft-delete.svg?style=flat-square)](https://www.npmjs.com/package/loopback4-soft-delete)
[![License](https://img.shields.io/github/license/sourcefuse/loopback4-soft-delete.svg?color=blue&label=License&style=flat-square)](https://github.com/sourcefuse/loopback4-soft-delete/blob/master/LICENSE)
[![Downloads](https://img.shields.io/npm/dw/loopback4-soft-delete.svg?label=Downloads&style=flat-square&color=blue)](https://www.npmjs.com/package/loopback4-soft-delete)
[![Total Downloads](https://img.shields.io/npm/dt/loopback4-soft-delete.svg?label=Total%20Downloads&style=flat-square&color=blue)](https://www.npmjs.com/package/loopback4-soft-delete)

## Install

```sh
npm install loopback4-soft-delete
```

## Quick Starter

For a quick starter guide, you can refer to our [loopback 4 starter](https://github.com/sourcefuse/loopback4-starter) application which utilizes this package for soft-deletes in a multi-tenant application.

## Transaction support

With version 3.0.0, transaction repository support has been added. In place of SoftCrudRepository, extend your repository with DefaultTransactionSoftCrudRepository. For further usage guidelines, refer below.

## Usage

Right now, this extension exports three abstract classes which are actually helping with soft delete operations.

- **SoftDeleteEntity** -
  An abstract base class for all models which require soft delete feature.
  This class is a wrapper over Entity class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository) adding three attributes to the model class for handling soft-delete, namely, deleted, deletedOn, deletedBy.
  The column names needed to be there in DB within that table are - 'deleted', 'deleted_on', 'deleted_by'.
  If you are using auto-migration of loopback 4, then, you may not need to do anything specific to add this column.
  If not, then please add these columns to the DB table.
- **SoftCrudRepository** -
  An abstract base class for all repositories which require soft delete feature.
  This class is going to be the one which handles soft delete operations and ensures soft deleted entries are not returned in responses, However if there is a need to query soft deleted entries as well,there is an options to achieve that and you can use findAll() in place of find() , findOneIncludeSoftDelete() in place of findOne() and findByIdIncludeSoftDelete() in place of findById(), these will give you the responses including soft deleted entries.
  This class is a wrapper over DefaultCrudRepository class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository).
- **DefaultTransactionSoftCrudRepository** -
  An abstract base class for all repositories which require soft delete feature with transaction support.
  This class is going to be the one which handles soft delete operations and ensures soft deleted entries are not returned in responses, However if there is a need to query soft deleted entries as well,there is an options to achieve that and you can use findAll() in place of find() , findOneIncludeSoftDelete() in place of findOne() and findByIdIncludeSoftDelete() in place of findById(), these will give you the responses including soft deleted entries.
  This class is a wrapper over DefaultTransactionalRepository class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository).

In order to use this extension in your LB4 application, please follow below steps.

1. Extend models with SoftDeleteEntity class replacing Entity. For example,

```ts
import {model, property} from '@loopback/repository';
import {SoftDeleteEntity} from 'loopback4-soft-delete';

@model({
  name: 'users',
})
export class User extends SoftDeleteEntity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  // .... More properties
}
```

2. Extend repositories with SoftCrudRepository class replacing DefaultCrudRepository. For example,

```ts
import {Getter, inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {AuthenticationBindings, IAuthUser} from 'loopback4-authentication';

import {PgdbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends SoftCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    protected readonly getCurrentUser: Getter<IAuthUser | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
```

3. For transaction support, extend repositories with DefaultTransactionSoftCrudRepository class replacing DefaultTransactionalRepository. For example,

```ts
import {Getter, inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {AuthenticationBindings, IAuthUser} from 'loopback4-authentication';

import {PgdbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends DefaultTransactionSoftCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    protected readonly getCurrentUser: Getter<IAuthUser | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
```

The package also provides the following mixins which can be used for soft delete functionality:

- **SoftDeleteEntityMixin**: This mixin adds the soft delete properties to your model. The properties added are represented by the IBaseEntity interface:

```ts
interface IBaseEntity {
  deleted?: boolean;
  deletedOn?: Date;
  deletedBy?: string;
}
```

There is also an option to provide config for the @property decorator for all these properties.
Usage of SoftDeleteEntityMixin is as follows:

```ts
class Item extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  constructor(data?: Partial<Item>) {
    super(data);
  }
}

@model()
export class ItemSoftDelete extends SoftDeleteEntityMixin(Item, {
  deletedBy: {name: 'deleted_by_userid'},
}) {}
```

- **SoftCrudRepositoryMixin**: You can make use of this mixin to get the soft delete functionality for DefaultCrudRepository or any respository that extends the DefaultCrudRepository. You need to extend your repository with this mixin and provide DefaultCrudRepository (or any repository that extends DefaultCrudRepository) as input. This means that this same mixin can also be used to provide soft delete functionality for DefaultTransactionSoftCrudRepository ( as DefaultTransactionSoftCrudRepository extends DefaultCrudRepository).You will have to inject the getter for IAuthUser in the contructor of your repository.
  Example:

```ts
import {Constructor, Getter, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthenticationBindings, IAuthUser} from 'loopback4-authentication';
import {SoftCrudRepositoryMixin} from 'loopback4-soft-delete';
import {TestDataSource} from '../datasources';
import {ItemSoftDelete, ItemSoftDeleteRelations} from '../models';

export class ItemRepository extends SoftCrudRepositoryMixin<
  ItemSoftDelete,
  typeof ItemSoftDelete.prototype.id,
  Constructor<
    DefaultCrudRepository<
      ItemSoftDelete,
      typeof ItemSoftDelete.prototype.id,
      ItemSoftDeleteRelations
    >
  >,
  ItemSoftDeleteRelations
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.test') dataSource: TestDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<IAuthUser>,
  ) {
    super(ItemSoftDelete, dataSource);
  }
}
```

### deletedBy

Whenever any entry is deleted using deleteById, delete and deleteAll repository methods, it also sets deletedBy column with a value with user id whoever is logged in currently. Hence it uses a Getter function of IAuthUser type. However, if you want to use some other attribute of user model other than id, you can do it by overriding deletedByIdKey. Here is an example.

```ts
import {Getter, inject} from '@loopback/core';
import {SoftCrudRepository, IUser} from 'loopback4-soft-delete';
import {AuthenticationBindings, IAuthUser} from 'loopback4-authentication';

import {PgdbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends SoftCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    protected readonly getCurrentUser: Getter<(IAuthUser & IUser) | undefined>,
    protected readonly deletedByIdKey: string = 'userTenantId',
  ) {
    super(User, dataSource, getCurrentUser, deletedByIdKey);
  }
}
```

## License

[MIT](https://github.com/sourcefuse/loopback4-soft-delete/blob/master/LICENSE)
