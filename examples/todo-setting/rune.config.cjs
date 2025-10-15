const { join, resolve } = require('node:path');
/**
 * @type {import('@rune-ts/server').RuneConfigType}
 */
module.exports = {
  port: 5002,
  hostname: 'localhost',
  mode: 'render',
  sassOptions: {
    api: 'legacy',
    includePaths: [join(resolve(), 'common/style')],
    additionalData: `@import "base";`,
    silenceDeprecations: ['import'],
  },
  clientEntry: './src/app/client.ts',
  serverEntry: './src/server/server.ts',
  watchToReloadPaths: ['../../packages/rune'],
};
