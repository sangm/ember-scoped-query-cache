import Ember from 'ember';
import sinon from 'sinon';
import { ScopedStore } from 'ember-scoped-query-cache/utils';
import { module, test } from 'qunit';

const { RSVP } = Ember;

module('Unit | Mixin | scoped store', {
  beforeEach() {
    this.sandbox = sinon.sandbox.create();
    /**
     * Make promises synchronous for testing purpose.
     * We still have to wrap the objects in Promise so that chained calls `.catch` after `.then` works
     * The alternative is to wrap queryRecord in `.then` chains within each test
     */
    const promiseMock = {
      then: foo => RSVP.Promise.resolve(foo()),
      catch: bar => RSVP.Promise.resolve(bar())
    };

    this.queryRecordStub = this.sandbox.stub().returns(promiseMock);
    this.queryStub = this.sandbox.stub().returns(promiseMock);
    this.storeStub = {
      queryRecord: this.queryRecordStub,
      query: this.queryStub
    };

    this.scopedStore = new ScopedStore(this.storeStub);
  },

  afterEach() {
    this.sandbox.restore();
  }
});

test('queryRecord calls store queryRecord', function(assert) {
  const queryParams = { foo: 'abc' };

  this.scopedStore.queryRecord('foobar', queryParams);

  assert.equal(this.queryRecordStub.getCalls().length, 1);
});

test('query calls store query', function(assert) {
  const queryParams = { foo: 'abc' };

  this.scopedStore.query('foobar', queryParams);

  assert.equal(this.queryStub.getCalls().length, 1);
});

test('cache miss calls queryRecord twice', function(assert) {
  const queryParams = { foo: 'abc' };
  const cacheMissQueryParams = { foo: 'abcd' };

  this.scopedStore.queryRecord('foobar', queryParams);
  this.scopedStore.queryRecord('foobar', cacheMissQueryParams);

  assert.equal(this.queryRecordStub.getCalls().length, 2);
});

test('cache hit calls queryRecord once', function(assert) {
  assert.expect(1);

  const query = { a: '1' };

  this.scopedStore.queryRecord('foo', query);
  this.scopedStore.queryRecord('foo', query);
  this.scopedStore.queryRecord('foo', query);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    1,
    'cache hit only executes queryRecord once'
  );
});

test('query object order does not matter', function(assert) {
  assert.expect(1);

  const firstQuery = { firstArg: 'foooooooo', secondArg: 'barrrrrrrr' };
  const secondQuery = { secondArg: 'barrrrrrrr', firstArg: 'foooooooo' };

  this.scopedStore.queryRecord('foo', firstQuery);
  this.scopedStore.queryRecord('foo', secondQuery);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    1,
    'cache hit only executes queryRecord once'
  );
});

test('formatCacheKey is called on query', function(assert) {
  assert.expect(1);

  const firstQuery = { firstArg: 'fooo', secondArg: 'barr' };
  const secondQuery = { firstArg: 'fooo', secondArg: 'barr' };
  const formatCacheKey = (queryParams) => (
    Object
      .keys(queryParams)
      .reduce((finalObj, key) => {
        const val = queryParams[key];
        finalObj[key] = val.toUpperCase();
        return finalObj;
      }, {})
  );

  this.scopedStore.queryRecord('foo', firstQuery, { formatCacheKey });
  this.scopedStore.queryRecord('foo', secondQuery);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    2,
    'formatCacheKey should convert vales to uppercase and result in cache miss'
  );
});

test('if shouldCachePredicate is false, do not insert into cache', function(assert) {
  assert.expect(1);

  const shouldCachePredicate = () => false;
  const firstQuery = { firstArg: 'foo', secondArg: 'bar' };
  const secondQuery = { firstArg: 'foo', secondArg: 'bar' };

  this.scopedStore.queryRecord('foo', firstQuery, { shouldCachePredicate });
  this.scopedStore.queryRecord('foo', secondQuery);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    2,
    'shouldCachePredicate should make sure nothing is in cache'
  );
});
