'use strict';

const seedData = async () => {
  const categoryCount = await strapi.entityService.count('api::category.category');
  if (categoryCount > 0) {
    strapi.log.info('Database already seeded. Skipping...');
    return;
  }

  const author = await strapi.entityService.create('api::author.author', {
    data: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  });

  const techCategory = await strapi.entityService.create('api::category.category', {
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest news about technology',
    },
  });

  const lifestyleCategory = await strapi.entityService.create('api::category.category', {
    data: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Tips and guides for modern living',
    },
  });

  await strapi.entityService.create('api::article.article', {
    data: {
      title: 'Getting Started with Strapi 5',
      slug: 'getting-started-strapi-5',
      description: 'Learn how to build powerful APIs with Strapi 5',
      category: techCategory.id,
      authorsBio: author.id,
      blocks: [
        {
          __component: 'shared.rich-text',
          body: '<p>Strapi 5 brings many new features and improvements...</p>',
        },
      ],
      publishedAt: new Date(),
    },
  });

  await strapi.entityService.create('api::article.article', {
    data: {
      title: 'Modern Web Development Tips',
      slug: 'modern-web-dev-tips',
      description: 'Essential tips for modern web developers',
      category: techCategory.id,
      authorsBio: author.id,
      blocks: [
        {
          __component: 'shared.rich-text',
          body: '<p>Web development is constantly evolving...</p>',
        },
      ],
      publishedAt: new Date(),
    },
  });

  await strapi.entityService.create('api::article.article', {
    data: {
      title: 'Healthy Work-Life Balance',
      slug: 'healthy-work-life-balance',
      description: 'Tips for maintaining balance in your daily life',
      category: lifestyleCategory.id,
      authorsBio: author.id,
      blocks: [
        {
          __component: 'shared.rich-text',
          body: '<p>Finding balance is essential for productivity...</p>',
        },
      ],
      publishedAt: new Date(),
    },
  });

  await strapi.entityService.create('api::global.global', {
    data: {
      title: 'My Blog',
      description: 'A blog powered by Strapi 5 and Next.js',
    },
  });

  strapi.log.info('Database seeded successfully!');
};

module.exports = {
  register(/*{ strapi }*/) {},
  async bootstrap(/*{ strapi }*/) {
    await seedData();
  },
};
