import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | posts');

test('visiting /posts', function(assert) {
  visit('/posts');

  andThen(function() {
    let posts = document.querySelectorAll('.post');
    assert.ok(posts.length > 0, 'expected many posts to be rendered')
    assert.equal(currentURL(), '/posts');
  });

  click('.post:first-child a');

  andThen(function() {
    assert.equal(currentURL(), '/posts/1');
    let postTitle = document.querySelector('#post-detail > h1');
    assert.equal(postTitle.innerText, 'fringilla purus mauris a nunc. In at pede. Cras vulputate');
  });
});
