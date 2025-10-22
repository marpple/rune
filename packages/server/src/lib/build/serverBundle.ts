import webpack from 'webpack';
import type { StartServerOptions } from '../startServer';
import { getRuneConfig } from '../getRuneConfig';
import { serverConfigs } from '../baseWebpackConfig';
import logger from '../logHelper/logger';

export const startServerBundle = async (serverOptions: StartServerOptions) => {
  serverOptions = {
    ...serverOptions,
    ...(await getRuneConfig({ cwd: serverOptions.dir, config: serverOptions.config })),
  };

  const config = serverConfigs(serverOptions);

  const server_compiler = webpack(config);

  server_compiler.run((err, stats) => {
    if (err) {
      logger.error(err);
    }
    console.log(stats?.toString({ colors: true }));

    if (process.send) {
      process.send({
        done: true,
      });
    }
  });

  process.on('exit', () => {
    server_compiler.close(() => {
      process.exit(0);
    });
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
