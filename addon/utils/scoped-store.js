import Ember from 'ember';
import { QueryCache, sortedObject } from 'ember-scoped-query-cache/utils';

const {
  assert,
  typeOf
} = Ember;

export default class ScopedStore {
  constructor(store) {
    this._store = store;
    this._queryCache = new QueryCache();
  }

  query(modelName, query, options = {}) {
    return this._getFromCache(modelName, query, options, this._store.query);
  }

  queryRecord(modelName, query, options = {}) {
    return this._getFromCache(modelName, query, options, this._store.queryRecord);
  }

  findRecord() {
    // TODO: Discuss what we need to do here..
    return this._store.findRecord(...arguments);
  }

  _getStringifiedQuery(query, formatCacheKey) {
    const queryCache = typeof(formatCacheKey) === 'function' ?
          formatCacheKey(query) :
          query;

    assert('queryCache needs to be an object', typeOf(queryCache) === 'object');
    return JSON.stringify(sortedObject(queryCache));
  }

  _getFromCache(modelName, query, options = {}, queryMethod) {
    const { formatCacheKey, shouldCachePredicate } = options;

    /**
     * Convert the object to a string with sorted keys
     * Check if we have a cache hit, and if not, insert into cache
     */
    const stringifiedQuery = this._getStringifiedQuery(query, formatCacheKey);
    const cacheHit = this._queryCache.get(modelName, stringifiedQuery);

    if (cacheHit) {
      return cacheHit;
    }

    const queryPromise = queryMethod(modelName, query);

    // TODO: need to consider what to do if this promise fails
    return queryPromise.then(results => {
      const shouldCache = typeof(shouldCachePredicate) === 'function' ?
        shouldCachePredicate(query, results) :
        true;
      assert('shouldCache needs to be a boolean value', typeof(shouldCache) === 'boolean');

      if (shouldCache) {
        this._queryCache.add(modelName, stringifiedQuery, queryPromise);
      }

      return results;
    });
  }

  scheduleDecay(delay, onDecay) {
    this._queryCache.scheduleDecay(delay, onDecay);
  }

  cancelDecay() {
    this._queryCache.cancelDecay();
  }

  destroy() {
    this._queryCache.destroy();
  }
}
