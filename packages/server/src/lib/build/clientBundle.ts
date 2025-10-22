import webpack from 'webpack';
import type { StartServerOptions } from '../startServer';
import { getRuneConfig } from '../getRuneConfig';
import { clientConfigs } from '../baseWebpackConfig';
import logger from '../logHelper/logger';

export const startClientBundle = async (clientOptions: StartServerOptions) => {
  clientOptions = {
    ...clientOptions,
    ...(await getRuneConfig({ cwd: clientOptions.dir, config: clientOptions.config })),
  };

  const config = clientConfigs(clientOptions);

  const client_compiler = webpack(config);

  client_compiler.run((err, stats) => {
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
    client_compiler.close(() => {
      process.exit(0);
    });
  });
};

const exitProcess = (err) => {
  logger.error(err?.stack ?? err);
  logger.error('Client Bundle Start failed.');
  process.exit(0);
};

process.on('uncaughtException', exitProcess);
process.on('unhandledRejection', exitProcess);

if (process.send) {
  process.addListener('message', async (msg: any) => {
    if (msg && typeof msg && msg.workerOptions && process.send) {
      await startClientBundle(msg.workerOptions);
    }
  });
}
