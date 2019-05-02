# loopback4-soft-delete

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## Install

```sh
npm install loopback4-soft-delete
```

## Usage

Right now, this extension exports two abstract classes which are actually helping with soft delete operations.

- **SoftDeleteEntity** -
  An abstract base class for all models which require soft delete feature.
  This class is a wrapper over Entity class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository) adding a new attribute 'deleted' (boolean) to the model class.
  Same column is needed to be there in DB within that table.
  If you are using auto-migration of loopback 4, then, you may not need to do anything specific to add this column.
  If not, then please add this column to the DB table.
- **SoftCrudRepository** -
  An abstract base class for all repositories which require soft delete feature.
  This class is going to be the one which handles soft delete operations and ensures soft deleted entries are not returned in responses at all.
  This class is a wrapper over DefaultCrudRepository class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository).

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
import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';

import {PgdbDataSource} from '../datasources';
import {User} from '../models';

export class UserRepository extends SoftCrudRepository<
  User,
  typeof User.prototype.id
> {
  constructor(@inject('datasources.pgdb') dataSource: PgdbDataSource) {
    super(User, dataSource);
  }
}
```

## License

[MIT](https://github.com/sourcefuse/loopback4-soft-delete/blob/master/LICENSE)
