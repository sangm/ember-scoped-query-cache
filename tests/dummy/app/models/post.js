import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string', {defaultValue: ''}),
  author: DS.belongsTo('author'),
  date: DS.attr('date'),
  body: DS.attr('string', {defaultValue: ''})
});
