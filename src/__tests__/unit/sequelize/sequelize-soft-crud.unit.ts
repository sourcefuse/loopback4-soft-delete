import {expect} from '@loopback/testlab';

import {Getter} from '@loopback/context';
import {
  Entity,
  EntityNotFoundError,
  Model,
  model,
  property,
} from '@loopback/repository';
import {fail} from 'assert';
import {SoftDeleteEntity} from '../../../models';
import {IUser} from '../../../types';
import {SequelizeDataSource} from '@loopback/sequelize';
import {SequelizeSoftCrudRepository} from '../../../repositories/sequelize/sequelize.soft-crud.repository.base';

/**
 * A mock up model class
 */
@model()
class Customer extends SoftDeleteEntity {
  @property({
    id: true,
  })
  id: number;

  @property()
  email: string;
}

@model()
class Customer2 extends SoftDeleteEntity {
  @property({
    id: true,
  })
  id: number;

  @property()
  email: string;
}

@model()
class User extends Model implements IUser {
  @property({
    id: true,
  })
  id: string;

  @property()
  username: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

@model()
class UserWithCustomId extends Model implements IUser {
  @property({
    id: true,
  })
  id: string;

  @property()
  username: string;

  getIdentifier() {
    return this.username;
  }

  constructor(data?: Partial<UserWithCustomId>) {
    super(data);
  }
}

class CustomerCrudRepo extends SequelizeSoftCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  {}
> {
  constructor(
    entityClass: typeof Entity & {
      prototype: Customer;
    },
    dataSource: SequelizeDataSource,
    public readonly getCurrentUser: Getter<IUser | undefined>,
  ) {
    super(entityClass, dataSource, getCurrentUser);
  }
}

class Customer2CrudRepo extends SequelizeSoftCrudRepository<
  Customer2,
  typeof Customer2.prototype.id,
  {}
> {
  constructor(
    entityClass: typeof Entity & {
      prototype: Customer;
    },
    dataSource: SequelizeDataSource,
    public readonly getCurrentUser: Getter<IUser | undefined>,
  ) {
    super(entityClass, dataSource, getCurrentUser);
  }
}

describe('SoftCrudRepositoryMixin with Sequelize Repository', () => {
  let repo: CustomerCrudRepo;
  let repoWithCustomDeletedByKey: Customer2CrudRepo;
  const userData: User = new User({
    id: '1',
    username: 'test',
  });

  const userData2: UserWithCustomId = new UserWithCustomId({
    id: '2',
    username: 'test2',
  });

  before(async () => {
    const ds: SequelizeDataSource = new SequelizeDataSource({
      name: 'db',
      host: '0.0.0.0',
      connector: 'sqlite3',
      database: 'database',
      file: ':memory:',
    });
    await ds.init();

    repo = new CustomerCrudRepo(Customer, ds, () => Promise.resolve(userData));
    await repo.syncLoadedSequelizeModels({force: true});

    repoWithCustomDeletedByKey = new Customer2CrudRepo(Customer2, ds, () =>
      Promise.resolve(userData2),
    );
    await repoWithCustomDeletedByKey.syncLoadedSequelizeModels({force: true});
  });

  afterEach(clearTestData);

  describe('find', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should find non soft deleted entries', async () => {
      const customers = await repo.find();
      expect(customers).to.have.length(3);
    });
    it('should find non soft deleted entries with and operator', async () => {
      const customers = await repo.find({
        where: {
          and: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        },
      });
      expect(customers).to.have.length(1);
    });
    it('should not find soft deleted entries with and operator', async () => {
      const deletedCustomers = await repo.find({
        where: {
          and: [
            {
              email: 'alice@example.com',
            },
            {
              id: 2,
            },
          ],
        },
      });
      expect(deletedCustomers).to.have.length(0);
    });
    it('should find non soft deleted entries with or operator', async () => {
      const customers = await repo.find({
        where: {
          or: [
            {
              email: 'john@example.com',
            },
            {
              email: 'alice@example.com',
            },
          ],
        },
      });
      expect(customers).to.have.length(1);
    });
  });

  describe('findAll', () => {
    it('should find all entries, soft deleted and otherwise', async () => {
      await setupTestData();
      const customers = await repo.findAll();
      expect(customers).to.have.length(4);
    });
  });

  describe('findOne', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should find one non soft deleted entry', async () => {
      const customer = await repo.findOne({
        where: {
          email: 'john@example.com',
        },
      });
      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should find none soft deleted entries', async () => {
      const customer = await repo.findOne({
        where: {
          email: 'alice@example',
        },
      });
      expect(customer).to.be.null();
    });

    it('should find one non soft deleted entry using and operator', async () => {
      const customer = await repo.findOne({
        where: {
          and: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        },
      });

      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should find none soft deleted entry using and operator', async () => {
      const customer = await repo.findOne({
        where: {
          and: [
            {
              email: 'alice@example.com',
            },
            {
              id: 3,
            },
          ],
        },
      });

      expect(customer).to.be.null();
    });

    it('should find one non soft deleted entry using or operator', async () => {
      const customer = await repo.findOne({
        where: {
          or: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        },
      });

      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('shound find none soft deleted entry using or operator', async () => {
      const customer = await repo.findOne({
        where: {
          or: [
            {
              email: 'alice@example.com',
            },
            {
              id: 3,
            },
          ],
        },
      });

      expect(customer).to.be.null();
    });
  });

  describe('findOneIncludeSoftDelete', () => {
    it('should find one soft deleted entry', async () => {
      await repo.create({id: 3, email: 'alice@example.com'});
      await repo.deleteById(3);
      const customer = await repo.findOneIncludeSoftDelete({
        where: {
          email: 'alice@example.com',
        },
      });

      expect(customer).to.have.property('email').equal('alice@example.com');
    });
  });

  describe('findById', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);

    it('should find one non soft deleted entry by id', async () => {
      const customer = await repo.findById(1);
      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should reject on finding soft deleted entry by id', async () => {
      try {
        await repo.findById(3);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
    });

    it('should find one non soft deleted entry by id, using and operator', async () => {
      const customer = await repo.findById(1, {
        where: {
          and: [{email: 'john@example.com'}, {id: 1}],
        },
      });
      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should find no soft deleted entry by id, using and operator', async () => {
      try {
        await repo.findById(3, {
          where: {
            and: [{email: 'alice@example.com'}, {id: 3}],
          },
        });
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
    });

    it('should find one non soft deleted entry by id, using or operator', async () => {
      const customer = await repo.findById(1, {
        where: {
          or: [{email: 'john@example.com'}, {id: 1}],
        },
      });
      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should find no soft entry by id, using or operator', async () => {
      try {
        await repo.findById(3, {
          where: {
            or: [{email: 'alice@example.com'}, {id: 3}],
          },
        });
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
    });
    it('should not return soft deleted entry by id, without using deleted in fields filter', async () => {
      try {
        await repo.findById(3, {
          fields: {
            id: true,
            email: true,
          },
        });
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
    });
    it('should not return soft deleted entry by id, without using deleted in fields filter(fields fileter is passed as array)', async () => {
      try {
        await repo.findById(3, {
          fields: ['id', 'email'],
        });
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
    });
    it('should return requested fields only when not using deleted in fields filter', async () => {
      const customer = await repo.findById(4, {
        fields: {
          id: true,
          email: true,
        },
      });
      expect(customer).to.not.have.property('deleted');
    });
    it('should return requested fields matched with fields filter', async () => {
      const customer = await repo.findById(4, {
        fields: {
          id: true,
          email: true,
          deleted: true,
        },
      });
      expect(customer).to.have.property('deleted');
    });
    it('should return requested fields only when not using deleted in fields filter array', async () => {
      const customer = await repo.findById(4, {
        fields: ['id', 'email'],
      });
      expect(customer).to.not.have.property('deleted');
    });
    it('should return requested fields matched with fields filter array', async () => {
      const customer = await repo.findById(4, {
        fields: ['id', 'email', 'deleted'],
      });
      expect(customer).to.have.property('deleted');
    });
  });

  describe('findByIdIncludeSoftDelete', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should find one by id', async () => {
      const customer = await repo.findByIdIncludeSoftDelete(1);
      expect(customer).to.have.property('email').equal('john@example.com');
    });
    it('should find one by id even if soft deleted', async () => {
      const customer = await repo.findByIdIncludeSoftDelete(3);
      expect(customer).to.have.property('email').equal('alice@example.com');
    });
    it('should find one by id with and operator', async () => {
      const customer = await repo.findByIdIncludeSoftDelete(1, {
        where: {
          and: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        },
      });
      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should find one soft deleted entry by id with and operator', async () => {
      const customer = await repo.findByIdIncludeSoftDelete(3, {
        where: {
          and: [
            {
              email: 'alice@example.com',
            },
            {
              id: 3,
            },
          ],
        },
      });
      expect(customer).to.have.property('email').equal('alice@example.com');
    });

    it('should find one by id with or operator', async () => {
      const customer = await repo.findByIdIncludeSoftDelete(1, {
        where: {
          or: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        },
      });
      expect(customer).to.have.property('email').equal('john@example.com');
    });

    it('should find one soft deleted entry by id with or operator', async () => {
      const customer = await repo.findByIdIncludeSoftDelete(3, {
        where: {
          or: [
            {
              email: 'alice@example.com',
            },
            {
              id: 3,
            },
          ],
        },
      });
      expect(customer).to.have.property('email').equal('alice@example.com');
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await repo.create({id: 1, email: 'john@example.com'});
      await repo.create({id: 2, email: 'mary@example.com'});
      await repo.create({id: 3, email: 'alice@example.com'});
      await repo.create({id: 4, email: 'bob@example.com'});
      await repo.deleteById(3);
    });
    afterEach(async () => {
      await repo.deleteAllHard();
    });
    it('should update non soft deleted entries', async () => {
      const customers = await repo.updateAll(
        {
          email: 'johnupdated@example',
        },
        {
          id: 1,
        },
      );
      expect(customers.count).to.eql(1);
    });
    it('should update non soft deleted entries with and operator', async () => {
      const customers = await repo.updateAll(
        {
          email: 'johnupdated@example',
        },
        {
          and: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        },
      );
      expect(customers.count).to.eql(1);
      const deletedCustomers = await repo.updateAll(
        {
          email: 'aliceupdated@example',
        },
        {
          and: [
            {
              email: 'alice@example.com',
            },
            {
              id: 2,
            },
          ],
        },
      );
      expect(deletedCustomers.count).to.eql(0);
    });
    it('should update non soft deleted entries with or operator', async () => {
      const customers = await repo.updateAll(
        {
          email: 'updated@example.com',
        },
        {
          or: [
            {
              email: 'john@example.com',
            },
            {
              email: 'alice@example.com',
            },
          ],
        },
      );
      expect(customers.count).to.eql(1);
    });
  });

  describe('count', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should return count for non soft deleted entries', async () => {
      const count = await repo.count({
        email: 'john@example.com',
      });
      expect(count.count).to.be.equal(1);
    });
    it('should return zero count for soft deleted entries', async () => {
      const count = await repo.count({
        email: 'alice@example.com',
      });
      expect(count.count).to.be.equal(0);
    });
    it('should return count for non soft deleted entries with and operator', async () => {
      const count = await repo.count({
        and: [
          {
            email: 'john@example.com',
          },
          {
            id: 1,
          },
        ],
      });
      expect(count.count).to.be.equal(1);
    });
    it('should return zero count for soft deleted entries with and operator', async () => {
      const count = await repo.count({
        and: [
          {
            email: 'alice@example.com',
          },
          {
            id: 3,
          },
        ],
      });
      expect(count.count).to.be.equal(0);
    });
    it('should return count for non soft deleted entries with or operator', async () => {
      const count = await repo.count({
        or: [{email: 'john@example.com'}, {id: 1}],
      });
      expect(count.count).to.be.equal(1);
    });
    it('should return zero for soft deleted entries with or operator', async () => {
      const count = await repo.count({
        or: [{email: 'alice@example.com'}, {id: 3}],
      });
      expect(count.count).to.be.equal(0);
    });
  });

  describe('countAll', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should return total count when no conditions are passed', async () => {
      const count = await repo.countAll();
      expect(count.count).to.be.equal(4);
    });
    it('should return count for soft deleted entries when conditions specified', async () => {
      const count = await repo.countAll({
        email: 'alice@example.com',
      });
      expect(count.count).to.be.equal(1);
    });
  });

  describe('deleteById', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);

    it('should soft delete entries', async () => {
      await repo.deleteById(1);
      try {
        await repo.findById(1);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
      const afterDeleteIncludeSoftDeleted =
        await repo.findByIdIncludeSoftDelete(1);
      expect(afterDeleteIncludeSoftDeleted)
        .to.have.property('email')
        .equal('john@example.com');
    });

    it('should soft delete entries with deletedBy set to id', async () => {
      await repo.deleteById(1);
      try {
        await repo.findById(1);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
      const afterDeleteIncludeSoftDeleted =
        await repo.findByIdIncludeSoftDelete(1);
      expect(afterDeleteIncludeSoftDeleted)
        .to.have.property('deletedBy')
        .equal(userData.id);
    });

    it('should soft delete entries with deletedBy set to custom key provided', async () => {
      await repoWithCustomDeletedByKey.deleteById(1);
      try {
        await repoWithCustomDeletedByKey.findById(1);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
      const afterDeleteIncludeSoftDeleted =
        await repoWithCustomDeletedByKey.findByIdIncludeSoftDelete(1);
      expect(afterDeleteIncludeSoftDeleted)
        .to.have.property('deletedBy')
        .equal(userData2.username);
    });
  });

  describe('delete', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);

    it('should soft delete entries', async () => {
      const entity = await repo.findById(1);
      await repo.delete(entity);
      try {
        await repo.findById(1);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
      const afterDeleteIncludeSoftDeleted =
        await repo.findByIdIncludeSoftDelete(1);
      expect(afterDeleteIncludeSoftDeleted)
        .to.have.property('email')
        .equal('john@example.com');
    });

    it('should soft delete entries with deletedBy set to id', async () => {
      const entity = await repo.findById(1);
      await repo.delete(entity);
      try {
        await repo.findById(1);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
      const afterDeleteIncludeSoftDeleted =
        await repo.findByIdIncludeSoftDelete(1);
      expect(afterDeleteIncludeSoftDeleted)
        .to.have.property('deletedBy')
        .equal(userData.id);
    });

    it('should soft delete entries with deletedBy set to custom key provided', async () => {
      const entity = await repoWithCustomDeletedByKey.findById(1);
      await repoWithCustomDeletedByKey.delete(entity);
      try {
        await repoWithCustomDeletedByKey.findById(1);
        fail();
      } catch (e) {
        expect(e.message).to.be.equal('EntityNotFound');
      }
      const afterDeleteIncludeSoftDeleted =
        await repoWithCustomDeletedByKey.findByIdIncludeSoftDelete(1);
      expect(afterDeleteIncludeSoftDeleted)
        .to.have.property('deletedBy')
        .equal(userData2.username);
    });
  });

  describe('deleteAll', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);

    it('should soft delete all entries', async () => {
      await repo.deleteAll();
      const customers = await repo.find();
      expect(customers).to.have.length(0);
      const afterDeleteAll = await repo.findAll();
      expect(afterDeleteAll).to.have.length(4);
    });

    it('should soft delete entries with deletedBy set to id', async () => {
      await repo.deleteAll();
      const customers = await repo.find();
      expect(customers).to.have.length(0);
      const afterDeleteAll = await repo.findAll();
      expect(afterDeleteAll).to.have.length(4);
      afterDeleteAll.forEach(rec => {
        expect(rec).to.have.property('deletedBy').equal(userData.id);
      });
    });

    it('should soft delete entries with deletedBy set to custom key provided', async () => {
      await repoWithCustomDeletedByKey.deleteAll();
      const customers = await repoWithCustomDeletedByKey.find();
      expect(customers).to.have.length(0);
      const afterDeleteAll = await repoWithCustomDeletedByKey.findAll();
      expect(afterDeleteAll).to.have.length(4);
      afterDeleteAll.forEach(rec => {
        expect(rec).to.have.property('deletedBy').equal(userData2.username);
      });
    });
  });

  describe('deleteHard', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should hard delete an entry', async () => {
      const customer = await repo.findById(1);
      await repo.deleteHard(customer);
      try {
        await repo.findByIdIncludeSoftDelete(1);
        fail();
      } catch (e) {
        expect(e).to.be.instanceOf(EntityNotFoundError);
      }
    });
  });

  describe('deleteByIdHard', () => {
    beforeEach(setupTestData);
    afterEach(clearTestData);
    it('should hard delete an entry by id', async () => {
      await repo.deleteByIdHard(1);
      try {
        await repo.findByIdIncludeSoftDelete(1);
        fail();
      } catch (e) {
        expect(e).to.be.instanceOf(EntityNotFoundError);
      }
    });
  });

  async function setupTestData() {
    await repo.create({id: 1, email: 'john@example.com'});
    await repo.create({id: 2, email: 'mary@example.com'});
    await repo.create({id: 3, email: 'alice@example.com'});
    await repo.create({id: 4, email: 'bob@example.com'});
    await repo.deleteById(3);

    await repoWithCustomDeletedByKey.create({id: 1, email: 'john@example.com'});
    await repoWithCustomDeletedByKey.create({id: 2, email: 'mary@example.com'});
    await repoWithCustomDeletedByKey.create({
      id: 3,
      email: 'alice@example.com',
    });
    await repoWithCustomDeletedByKey.create({id: 4, email: 'bob@example.com'});
    await repoWithCustomDeletedByKey.deleteById(3);
  }

  async function clearTestData() {
    await repo.deleteAllHard();
    await repoWithCustomDeletedByKey.deleteAllHard();
  }
});
