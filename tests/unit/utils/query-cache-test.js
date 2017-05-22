import { module, test } from 'qunit';
import { QueryCache } from 'ember-scoped-query-cache/utils';

module('Unit | Utility | query-cache', {
  beforeEach() {
    this.queryCache = new QueryCache();
  }
});

test('QueryCache#add throws if key is undefined', function(assert) {
  assert.throws(() => {
    this.queryCache.add('my-type');
  });
});

test('QueryCache#add adds item to queryCache when all params specified', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');

  assert.equal(this.queryCache.has('my-type', 'mykey'), true);
});

test('QueryCache#has reports true to existing keys, and false for missing keys', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'undefined', undefined);
  this.queryCache.add('my-type', 'null', null);
  this.queryCache.add('my-type', 'false', false);
  this.queryCache.add('my-type', 'zero', 0);
  this.queryCache.add('my-type', 'NaN', NaN);

  assert.equal(this.queryCache.has('my-type', 'mykey'), true);
  assert.equal(this.queryCache.has('my-type', 'mykey-nope'), false);
  assert.equal(this.queryCache.has('my-type-nop', 'mykey'), false);

  assert.equal(this.queryCache.has('my-type', 'undefined'), true);
  assert.equal(this.queryCache.has('my-type', 'null'), true);
  assert.equal(this.queryCache.has('my-type', 'false'), true);
  assert.equal(this.queryCache.has('my-type', 'zero'), true);
  assert.equal(this.queryCache.has('my-type', 'NaN'), true);

  // test full lifecycle (including removal)
  this.queryCache.remove('my-type', 'mykey');
  this.queryCache.remove('my-type', 'undefined');
  this.queryCache.remove('my-type', 'null');
  this.queryCache.remove('my-type', 'false');
  this.queryCache.remove('my-type', 'zero');
  this.queryCache.remove('my-type', 'NaN');

  assert.equal(this.queryCache.has('my-type', 'mykey'), false);
  assert.equal(this.queryCache.has('my-type', 'mykey-nope'), false);
  assert.equal(this.queryCache.has('my-type-nop', 'mykey'), false);

  assert.equal(this.queryCache.has('my-type', 'undefined'), false);
  assert.equal(this.queryCache.has('my-type', 'null'), false);
  assert.equal(this.queryCache.has('my-type', 'false'), false);
  assert.equal(this.queryCache.has('my-type', 'zero'), false);
  assert.equal(this.queryCache.has('my-type', 'NaN'), false);
});

test('QueryCache#add updates existing value when key present', function(assert) {
  this.queryCache.add('my-type', 'mykey', 'myvalue');
  this.queryCache.add('my-type', 'mykey', 'mynewvalue');

  assert.equal(this.queryCache.get('my-type', 'mykey'), 'mynewvalue');
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
