#!/usr/bin/env node

import { checkNodeDebugType, getConfig, getDebugPort, getNodeOptionsWithoutInspect, printAndExit } from '../lib/util';
import { type ChildProcess, fork } from 'child_process';
import { once } from 'events';
import { getProjectDir } from '../lib/getProjectDir';
import { fileExists, FileType } from '../lib/fileExist';
import type arg from 'arg';
import logger from '../lib/logHelper/logger';
import type { StartServerOptions } from '../lib/startServer';
import { getRuneConfig } from '../lib/getRuneConfig';
import path from 'path';

let dir: string;
let serverBundleProcess: undefined | ChildProcess;
let clientBundleProcess: undefined | ChildProcess;
let sessionStopHandled = false;

const makeEnv = () => {
  const defaultEnv = process.env;
  let NODE_OPTIONS = getNodeOptionsWithoutInspect();
  const nodeDebugType = checkNodeDebugType();
  NODE_OPTIONS = `${NODE_OPTIONS} --enable-source-maps`;

  if (nodeDebugType) {
    NODE_OPTIONS = `${NODE_OPTIONS} --${nodeDebugType}=${getDebugPort() + 1}`;
  }

  return {
    ...defaultEnv,
    NODE_OPTIONS,
  };
};

const env = makeEnv();

const handleSessionStop = async (signal: NodeJS.Signals | number | null) => {
  if (clientBundleProcess?.pid) clientBundleProcess.kill(signal ?? 0);
  if (serverBundleProcess?.pid) serverBundleProcess.kill(signal ?? 0);
  if (sessionStopHandled) return;
  sessionStopHandled = true;

  if (clientBundleProcess?.pid && clientBundleProcess.exitCode === null && clientBundleProcess.signalCode === null) {
    await once(clientBundleProcess, 'exit').catch(() => {});
  }

  if (serverBundleProcess?.pid && serverBundleProcess.exitCode === null && serverBundleProcess.signalCode === null) {
    await once(serverBundleProcess, 'exit').catch(() => {});
  }

  process.exit(0);
};

process.on('SIGINT', () => {
  void handleSessionStop('SIGKILL').then((r) => r);
});
process.on('SIGTERM', () => {
  void handleSessionStop('SIGKILL').then((r) => r);
});

// exit event must be synchronous
process.on('exit', () => {
  clientBundleProcess?.kill('SIGKILL');
  serverBundleProcess?.kill('SIGKILL');
});

const build = async (args: arg.Result<arg.Spec>) => {
  if (args['--help']) {
    logger.info(`
      Description
        Builds the application for production

      Usage
        $ rune build -c <config file path>
        
      Options
        --help, -h                              Displays this message
        --config, -c                            config file path (default: rune.config.js)
    `);
    process.exit(0);
  }
  dir = getProjectDir('.');
  const config = getConfig(args);

  // Check if pages dir exists and warn if not
  if (!(await fileExists(dir, FileType.Directory))) {
    printAndExit(`> No such directory exists as the project root: ${dir}`);
  }

  async function preflight() {
    const { getPackageVersion } = require('../lib/getPackageVersion');

    const [sassVersion, nodeSassVersion] = await Promise.all([
      getPackageVersion({ cwd: dir, name: 'sass' }),
      getPackageVersion({ cwd: dir, name: 'node-sass' }),
    ]);
    if (sassVersion && nodeSassVersion) {
      logger.warn(
        'Your project has `sass` and `node-sass` installed as dependencies, but should only use one or the other. ' +
          'Please remove the `node-sass` dependency from your project. ',
      );
    }
  }

  await preflight();

  logger.event('Building your application...');

  const buildOption: StartServerOptions = {
    dir,
    isDev: false,
    config,
    ...(await getRuneConfig({ cwd: dir, config })),
  };

  await new Promise<void>((resolve) => {
    if (buildOption.mode === 'render' && buildOption.clientEntry) {
      const startClientBundleServerPath = path.resolve(__dirname, '../lib/build/clientBundle');
      clientBundleProcess = fork(startClientBundleServerPath, {
        stdio: 'inherit',
        env,
      });
      clientBundleProcess.send({ workerOptions: buildOption });
      clientBundleProcess.once('message', (msg: any) => {
        if (msg && typeof msg === 'object' && msg.done) {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
  await new Promise<void>((resolve) => {
    const startServerBundleServerPath = path.resolve(__dirname, '../lib/build/serverBundle');
    serverBundleProcess = fork(startServerBundleServerPath, {
      stdio: 'inherit',
      env,
    });
    serverBundleProcess.send({ workerOptions: buildOption });
    serverBundleProcess.once('message', (msg: any) => {
      if (msg && typeof msg === 'object' && msg.done) {
        resolve();
      }
    });
  });

  logger.event('Build Complete.');

  process.exit(0);
};

export { build };
