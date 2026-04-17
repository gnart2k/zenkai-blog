'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async search(ctx) {
    const { q } = ctx.query;
    
    if (!q || q.trim() === '') {
      return ctx.send({ data: [], meta: { total: 0 } });
    }

    try {
      const articles = await strapi.documents('api::article.article').findMany({
        filters: {
          $or: [
            { title: { $containsi: q } },
            { description: { $containsi: q } },
          ],
          publishedAt: { $notNull: true },
        },
        populate: ['cover', 'category', 'authorsBio'],
        sort: { publishedAt: 'desc' },
        limit: 20,
        status: 'published',
      });

      return ctx.send({ data: articles, meta: { total: articles.length } });
    } catch (error) {
      ctx.status = 500;
      return ctx.send({ error: error.message });
    }
  },

  async find(ctx) {
    try {
      const { slug, ...filters } = ctx.query;
      
      const queryFilters = {};
      if (slug) {
        queryFilters.slug = slug;
      }
      
      // Add any additional filters from query params
      if (filters.filters) {
        Object.assign(queryFilters, filters.filters);
      }

      const articles = await strapi.documents('api::article.article').findMany({
        filters: queryFilters,
        populate: ['cover', 'authorsBio.avatar', 'category', 'blocks', 'seo'],
        status: 'published',
        sort: { publishedAt: 'desc' },
      });

      return ctx.send({ data: articles, meta: { total: articles.length } });
    } catch (error) {
      ctx.status = 500;
      return ctx.send({ error: error.message });
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      const article = await strapi.documents('api::article.article').findOne({
        documentId: id,
        populate: ['cover', 'authorsBio.avatar', 'category', 'blocks', 'seo'],
        status: 'published',
      });

      if (!article) {
        return ctx.send({ data: null });
      }

      return ctx.send({ data: article });
    } catch (error) {
      ctx.status = 500;
      return ctx.send({ error: error.message });
    }
  },
}));