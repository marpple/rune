import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { serverConfigs } from './baseWebpackConfig';
import type { StartServerOptions } from './startServer';
import path from 'path';
import logger from './logHelper/logger';
import { getRuneConfig } from './getRuneConfig';

export const startServerBundle = async (serverOptions: StartServerOptions) => {
  serverOptions = {
    ...serverOptions,
    ...(await getRuneConfig({ cwd: serverOptions.dir, config: serverOptions.config })),
  };

  process.title = (serverOptions.name ?? 'rune-server') + '-server-bundle';

  const config = serverConfigs(serverOptions);

  const server_compiler = webpack(config);

  const static_server = new WebpackDevServer(
    {
      hot: false,
      liveReload: false,
      client: {
        logging: 'warn',
        overlay: false,
      },
      static: {
        directory: path.resolve(serverOptions.dir, `./.rune/dev/${serverOptions.name}/server/public`),
        publicPath: '/static/',
      },
      devMiddleware: {
        index: false,
        writeToDisk: true
      },
      compress: true,
      allowedHosts: 'all',
      port: serverOptions.port + 11000,
    },
    server_compiler,
  );

  server_compiler.hooks.beforeCompile.tap('RuneBeforeCompile', async () => {
    if (process.send) {
      process.send({
        beforeCompile: new Date().getTime(),
      });
    }
  });

  server_compiler.hooks.done.tap('RuneCompileDone', async (stats: webpack.Stats) => {
    if (stats) {
      if (stats?.hasErrors() || stats?.hasWarnings()) {
        logger.error(stats?.toString('errors-warnings'));

        if (stats?.hasErrors()) {
          logger.warn(`The server is not bundled. Please address this error.`);
        }
      }

      if (serverOptions.debug) {
        console.log(stats.toString({ colors: true }));
      }

      if (process.send) {
        process.send({
          done: new Date().getTime(),
        });
      }
    }
  });

  await static_server.start();

  process.on('exit', () => {
    static_server.close();
    process.exit(0);
  });
};

const exitProcess = (err) => {
  logger.error(err?.stack ?? err);
  logger.error('Server Bundle Start failed.');
  process.exit(0);
};

process.on('uncaughtException', exitProcess);
process.on('unhandledRejection', exitProcess);

if (process.send) {
  process.addListener('message', async (msg: any) => {
    if (msg && typeof msg && msg.workerOptions && process.send) {
      await startServerBundle(msg.workerOptions);
    }
  });
}
