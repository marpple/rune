import { devServerBundler } from './devBundler';
import path from 'path';
import Watchpack from 'watchpack';
import { RESTART_EXIT_CODE } from './util';
import express from 'express';
import { getServer } from './getServer';
import logger from './logHelper/logger';
import type { RuneConfigType } from '../types/rune';
import { setGlobal } from '../shared/global';
import { serverManifest, setClientManifest, setServerManifest } from '../server';
import { getRuneConfig } from './getRuneConfig';
import { isMatch } from 'picomatch';

if (global.performance && performance.getEntriesByName('rune-start').length === 0) {
  if (global.performance) performance.mark('rune-start');
}

export interface StartServerOptions extends RuneConfigType {
  isDev: boolean;
  dir: string;
  config: string;
}

export async function startServer(serverOptions: StartServerOptions) {
  serverOptions = {
    ...serverOptions,
    ...(await getRuneConfig({ cwd: serverOptions.dir, config: serverOptions.config })),
  };

  const { dir, isDev, hostname, port } = serverOptions;

  process.title = serverOptions.name ?? 'rune-server';

  const server = express();

  if (isDev) {
    setGlobal('rune_server', server);
    await devServerBundler(serverOptions, server);
  } else {
    setClientManifest(path.join(dir, `.rune/prod/${serverOptions.name}/client`));
    setServerManifest(path.join(dir, `.rune/prod/${serverOptions.name}/server`));

    if (!serverOptions.publicPath) {
      logger.warn('No publicPath found in config. Using default publicPath: /static');

      server.use(
        '/static',
        express.static(path.join(dir, `.rune/prod/${serverOptions.name}/client`), {
          immutable: true,
          maxAge: '1d',
          index: false,
          redirect: false,
        }),
      );
    }

    const router = await getServer(
      path.resolve(dir, `.rune/prod/${serverOptions.name}/server/` + serverManifest[`main.js`]),
    );

    if (!router) {
      throw new Error('Server router not found');
    }

    server.use(router);
  }

  const app = hostname
    ? server.listen(port, hostname, () => {
        logger.event(`Ready on "http://${hostname}:${port}"`);
      })
    : server.listen(port, () => {
        logger.event(`Ready on "${port}"`);
      });

  process.on('SIGTERM', () => {
    app.close((e) => process.exit(e ? 1 : 0));
  });

  process.on('SIGINT', () => {
    app.close((e) => process.exit(e ? 1 : 0));
  });

  if (isDev) {
    const wp = new Watchpack({
      ignored: (path) => {
        if (serverOptions.watchToIgnorePaths) {
          return /node_modules|\.rune|dist/.test(path) || isMatch(path, serverOptions.watchToIgnorePaths);
        }

        return /node_modules|\.rune|dist/.test(path);
      },
    });

    const directories = serverOptions.watchToReloadPaths;
    const files = [serverOptions.config];

    logger.event(
      `Watching for changes in ${[...files, ...(directories ?? []).map((file) => path.relative(dir, file))]
        .map((file) => path.relative(dir, file))
        .join(', ')}`,
    );

    wp.watch({
      files,
      directories,
    });

    wp.on('change', (filename) => {
      logger.info('\n');
      logger.event(`Found a change in ${path.basename(filename)}. Restarting the server to apply the changes...`);
      process.exit(RESTART_EXIT_CODE);
    });

    process.on('rejectionHandled', () => {
      // It is ok to await a Promise late in Next.js as it allows for better
      // prefetching patterns to avoid waterfalls. We ignore loggining these.
      // We should've already errored in anyway unhandledRejection.
    });

    const exitProcess = (err) => {
      wp.close();
      logger.error(err?.stack ?? err);
      logger.error('Server failed to start.');
      process.exit(0);
    };

    process.on('uncaughtException', exitProcess);
    process.on('unhandledRejection', exitProcess);
  }
}

if (process.send) {
  process.addListener('message', async (msg: any) => {
    if (msg && typeof msg && msg.workerOptions && process.send) {
      await startServer(msg.workerOptions);
      process.send({ serverReady: true });
    }
  });
  process.send({ workerReady: true });
}
