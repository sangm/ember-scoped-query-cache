'use strict';

import POSTS from './posts';
import AUTHORS from './authors';

export default function() {
  this.get('/posts', () => {
    return {
      posts: POSTS
    };
  });

  this.get('/posts/:post_id', (_, request) => {
    let attributes = POSTS.find(post => post.id === Number(request.params.post_id));
    return {
      post: {
        id: attributes.id,
        type: 'post',
        attributes: attributes
      }
    };
  });

  this.get('/authors', () => {
    return {
      authors: AUTHORS
    };
  });
}
