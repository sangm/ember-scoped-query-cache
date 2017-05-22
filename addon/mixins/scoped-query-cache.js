import Ember from 'ember';
import { ScopedStore } from 'ember-scoped-query-cache/utils';

const {
  inject,
  Mixin
} = Ember;

export default Mixin.create({
  store: inject.service(),

  init() {
    this._super(...arguments);

    this.scopedStore = new ScopedStore(this.get('store'));
  },

  destroy() {
    this.scopedStore.destroy();

    this._super(...arguments);
  }
});
