import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let store = this.store;

    return Ember.RSVP.hash({
      content: store.findAll('post'),
      authors: store.findAll('author')
    });
  },

  setupController: function(controller, models) {
    controller.setProperties(models);
  }
});
