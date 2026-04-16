const path = require('path');

module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'sqlite'),
    connection: {
      filename: path.join(
        __dirname,
        '..',
        env('DATABASE_FILENAME', 'data.db')
      ),
    },
    useNullAsDefault: true,
  },
});
