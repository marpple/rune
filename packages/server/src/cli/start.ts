#!/usr/bin/env node

import type arg from 'arg';
import express from 'express';
import path from 'path';
import { fileExists, FileType } from '../lib/fileExist';
import { getProjectDir } from '../lib/getProjectDir';
import { getRuneConfig } from '../lib/getRuneConfig';
import { getProdServer } from '../lib/getServer';
import { getReservedPortExplanation, isPortIsReserved } from '../lib/helper/getReservedPort';
import logger from '../lib/logHelper/logger';
import type { StartServerOptions } from '../lib/startServer';
import { getConfig, getPort, printAndExit } from '../lib/util';
import { rune_closed, rune_emitter, serverManifest, setClientManifest, setServerManifest } from '../server';

let dir: string;

const start = async (args: arg.Result<arg.Spec>, configPath?: string) => {
  if (args['--help']) {
    logger.info(`
      Description
        Starts the application in production mode

      Usage
        $ rune start -p <port number> -c <config file path>

      Options
        --port, -p                              A port number to start the application on
        --help, -h                              Displays this message
        --config, -c                            config file path (default: rune.config.js)
        
      Hostname
        hostname is set to localhost by default, but you can change it by configuring the hostname in the rune.config.js file.
    `);
    process.exit(0);
  }
  dir = getProjectDir('.');

  // Check if pages dir exists and warn if not
  if (!(await fileExists(dir, FileType.Directory))) {
    printAndExit(`> No such directory exists as the project root: ${dir}`);
  }

  const port = getPort(args);
  const config = configPath ?? getConfig(args);

  if (isPortIsReserved(port)) {
    printAndExit(getReservedPortExplanation(port), 1);
  }

  const serverOptions: StartServerOptions = {
    dir,
    isDev: false,
    config,
    ...(await getRuneConfig({ cwd: dir, config })),
  };

  setClientManifest(path.join(dir, `.rune/prod/${serverOptions.name}/client`));
  setServerManifest(path.join(dir, `.rune/prod/${serverOptions.name}/server`));

  async function startServer() {
    process.title = serverOptions.name ?? `rune-server`;

    const server = await getProdServer(
      path.resolve(dir, `.rune/prod/${serverOptions.name}/server/` + serverManifest[`main.js`]),
    );

    if (!server) {
      throw new Error('Server not found');
    }

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

    const app = serverOptions.hostname
      ? server.listen(port, serverOptions.hostname, () => {
          logger.event(`Ready on "http://${serverOptions.hostname}:${port}"`);
        })
      : server.listen(port, () => {
          logger.event(`Ready on "${port}"`);
        });

    process.on('SIGINT', () => {
      if (!rune_closed) {
        rune_emitter.emit('close');
      }
      app.close((e) => process.exit(e ? 1 : 0));
    });
  }

  const runServer = async () => {
    try {
      await startServer();
    } catch (err) {
      logger.error(err);
      process.exit(1);
    }
  };

  await runServer();
};

export { start };
