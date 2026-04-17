'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};