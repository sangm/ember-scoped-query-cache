import { module, test } from 'qunit';
import { sortedObject } from 'ember-scoped-query-cache/utils';

module('Unit | Utility | sorted-object');

test('returns object with keys sorted', (assert) => {
  assert.deepEqual(sortedObject({}), {});
  assert.deepEqual(sortedObject({ a: 1 }), { a: 1 });
  assert.deepEqual(sortedObject({ b: 1, a: 1 }), { a: 1, b: 1});
});
