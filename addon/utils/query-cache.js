
const CACHE_DECAY_TIMEOUT = 5000;

export default class QueryCache {
  constructor() {
    this._init();
  }

  add(type, key, value) {
    if (!key) {
      throw new Error('You must provide a key to the `add` method when caching a value.');
    }

    this._internalCache[this._getKey(type, key)] = value;
  }

  remove(type, key) {
    delete this._internalCache[this._getKey(type, key)];
  }

  get(type, key) {
    return this._internalCache[this._getKey(type, key)];
  }

  has(type, key) {
    return this._getKey(type, key) in this._internalCache;
  }

  scheduleDecay(delay = CACHE_DECAY_TIMEOUT, onDecay) {
    if (this.decayId) {
      this.cancelDecay();
    }

    this.decayId = setTimeout(() => {
      this._init();

      onDecay && typeof onDecay === 'function' && onDecay();
    }, delay);
  }

  cancelDecay() {
    clearTimeout(this.decayId);
    this.decayId = null;
  }

  reset() {
    clearTimeout(this.decayId);
    this._init();
  }

  _init() {
    this._internalCache = Object.create(null);
    this.decayId = null;
  }

  _getKey(type, key) {
    return `${type}!${key}`;
  }
}
