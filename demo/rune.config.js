/**
 * @type {import('@rune-ts/server').RuneConfigType}
 */
module.exports = {
  port: 5001,
  hostname: 'localhost',
  mode: 'render',
  clientEntry: './src/app/client.ts',
  serverEntry: './src/server/server.ts',
  showBundleAnalyzer: false,
};
