import { join, resolve } from 'node:path';
/**
 * @type {import('@rune-ts/server').RuneConfigType}
 */
export default {
  port: 5001,
  hostname: 'localhost',
  mode: 'render',
  sassOptions: {
    includePaths: [join(resolve(), 'common/style')],
    additionalData: `@import "base";`,
  },
  clientEntry: './src/app/client.ts',
  serverEntry: './src/server/server.ts',
  watchToReloadPaths: ['../rune'],
};
