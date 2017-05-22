import { module, test } from 'qunit';
import { QueryCache } from 'ember-scoped-query-cache/utils';

module('Unit | Utility | query-cache', {
  beforeEach() {
    this.queryCache = new QueryCache();
  }
});

test('Creates queryCache object with internal map', function (assert) {
  assert.ok(this.queryCache._internalCache);
});

test('QueryCache#add throws if key is undefined', function(assert) {
  assert.throws(() => {
    this.queryCache.add('my-type');
  });
});

test('QueryCache#add adds item to queryCache when all params specified', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');

  assert.ok(this.queryCache._internalCache['my-type!mykey']);
});

test('QueryCache#add updates existing value when key present', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'mykey', 'mynewvalue');

  assert.equal(this.queryCache._internalCache['my-type!mykey'], 'mynewvalue');
});

test('QueryCache#remove removes items by key', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(this.queryCache._internalCache).length, 2);

  this.queryCache.remove('my-type', 'mykey');

  assert.equal(Object.keys(this.queryCache._internalCache).length, 1);
});

test('QueryCache#remove doesn\'t remove items when key not present', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(this.queryCache._internalCache).length, 2);

  this.queryCache.remove('my-type', 'randomkey');

  assert.equal(Object.keys(this.queryCache._internalCache).length, 2);
});

test('QueryCache#reset removes all items from queryCache', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'myotherkey', 'mynewvalue');
  this.queryCache.add('other-type', 'myotherkey', 'mynewvalue');
  this.queryCache.add('random-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(this.queryCache._internalCache).length, 4);

  this.queryCache.reset();

  assert.equal(Object.keys(this.queryCache._internalCache).length, 0);
  assert.equal(this.queryCache.decayId, null);
});

test('QueryCache#get retrieves item by key when key present', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(this.queryCache.get('my-type', 'myotherkey'), 'mynewvalue');
});

test('QueryCache#get does not retrieve item when key not present', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.notOk(this.queryCache.get('random-type', 'randomkey'));
});

test('QueryCache#scheduleDecay schedules the decay task', function(assert) {
  let done = assert.async();

  this.queryCache.add('type', 'key', 'value');

  this.queryCache.scheduleDecay(50, () => {
    assert.equal(Object.keys(this.queryCache._internalCache).length, 0);
    done();
  });
});

test('cancelDecay correctly cancels the cache decay', function(assert) {
  let done = assert.async();

  this.queryCache.add('type', 'key', 'value');

  this.queryCache.scheduleDecay(1000);
  this.queryCache.cancelDecay();

  setTimeout(() => {
    assert.equal(Object.keys(this.queryCache._internalCache).length, 1);
    assert.equal(this.queryCache.get('type', 'key'), 'value');

    done();
  }, 3000);
});
