import {expect} from '@loopback/testlab';

import {
  Constructor,
  Getter,
  MetadataInspector,
  MetadataMap,
} from '@loopback/context';
import {
  DefaultTransactionalRepository,
  Entity,
  juggler,
  model,
  MODEL_PROPERTIES_KEY,
  property,
} from '@loopback/repository';

import {PropertyDefinition} from 'loopback-datasource-juggler';
import {SoftCrudRepositoryMixin, SoftDeleteEntityMixin} from '../../..';
import {IUser} from '../../../types';
/**
 * A mock up model class
 */
class Customer extends Entity {
  @property({
    id: true,
    type: 'number',
    required: true,
  })
  id: number;
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

const configProperties = {
  deleted: {
    name: 'delete',
  },
  deletedBy: {
    name: 'deletedByUser',
  },
  deletedOn: {
    name: 'deletedOnDate',
    additionalProperty: 'value',
  },
};

@model()
class CustomerSoftDelete extends SoftDeleteEntityMixin(
  Customer,
  configProperties,
) {}

const config = {name: 'test_memory', connector: 'memory'};
export class TestDataSource extends juggler.DataSource {
  static dataSourceName = 'test';
  static readonly defaultConfig = config;
  constructor(dsConfig: object = config) {
    super(dsConfig);
  }
}

class CustomerCrudRepo extends SoftCrudRepositoryMixin<
  CustomerSoftDelete,
  typeof CustomerSoftDelete.prototype.id,
  Constructor<
    DefaultTransactionalRepository<
      CustomerSoftDelete,
      typeof CustomerSoftDelete.prototype.id,
      {}
    >
  >,
  {}
>(DefaultTransactionalRepository) {
  constructor(
    dataSource: juggler.DataSource,
    readonly getCurrentUser: Getter<IUser | undefined>,
  ) {
    super(CustomerSoftDelete, dataSource);
  }
}

describe('SoftCrudRepositoryMixin', () => {
  let repo: CustomerCrudRepo;
  let ds: juggler.DataSource;
  before(() => {
    ds = new TestDataSource();
    repo = new CustomerCrudRepo(ds, () =>
      Promise.resolve({
        id: '1',
        username: 'test',
      }),
    );
  });

  it('should contain soft delete properties', async () => {
    const res = await repo.create({
      id: 1,
      email: 'alice@example.com',
    });

    expect(res).to.have.property('deleted');
    expect(res).to.have.property('deletedOn');
    expect(res).to.have.property('deletedBy');
    await repo.deleteAllHard();
  });

  it('should be able to provide/override Metadata for soft delete properties', async () => {
    const res = MetadataInspector.getAllPropertyMetadata(
      MODEL_PROPERTIES_KEY,
      CustomerSoftDelete.prototype,
    ) as MetadataMap<PropertyDefinition>;

    expect(res.deletedBy.name).to.equal(configProperties.deletedBy.name);
    expect(res.deleted.name).to.equal(configProperties.deleted.name);
    expect(res.deletedOn.name).to.equal(configProperties.deletedOn.name);
    expect(res.deletedOn.additionalProperty).to.equal(
      configProperties.deletedOn.additionalProperty,
    );
  });
});
