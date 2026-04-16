module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: `https://${env('MINIO_ENDPOINT', 's3.zenkai.com.vn')}/${env('MINIO_BUCKET', 'blog')}`,
        rootPath: env('MINIO_BUCKET', 'blog'),
        s3Options: {
          endpoint: 'https://s3.zenkai.com.vn',
          forcePathStyle: true,
          credentials: {
            accessKeyId: env('MINIO_ACCESS_KEY'),
            secretAccessKey: env('MINIO_SECRET_KEY'),
          },
          region: 'us-east-1',
          params: {
            Bucket: env('MINIO_BUCKET', 'blog'),
          },
        },
      },
    },
  },
});
