module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'default-admin-jwt-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'default-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
});
