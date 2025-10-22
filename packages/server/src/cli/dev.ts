#!/usr/bin/env node

import {
  checkNodeDebugType,
  getConfig,
  getDebugPort,
  getNodeOptionsWithoutInspect,
  printAndExit,
  RESTART_EXIT_CODE,
} from '../lib/util';
import { type ChildProcess, fork } from 'child_process';
import os from 'os';
import { once } from 'events';
import { getProjectDir } from '../lib/getProjectDir';
import { fileExists, FileType } from '../lib/fileExist';
import type arg from 'arg';
import type { StartServerOptions } from '../lib/startServer';
import path from 'path';
import { getRuneConfig } from '../lib/getRuneConfig';
import logger from '../lib/logHelper/logger';

let dir: string;
let child: undefined | ChildProcess;
let sessionStopHandled = false;
let waitingChangeOrFirstStart = true;

const handleSessionStop = async (signal: NodeJS.Signals | number | null) => {
  if (child?.pid) child.kill(signal ?? 0);
  if (sessionStopHandled) return;
  sessionStopHandled = true;

  if (child?.pid && child.exitCode === null && child.signalCode === null) {
    await once(child, 'exit').catch(() => {});
  }
  process.stdout.write('\x1B[0m'); // 모든 속성 초기화
  process.stdout.write('\x1B[?25h');
  process.stdout.write('\n');
  process.exit(0);
};

process.on('SIGINT', () => handleSessionStop('SIGKILL'));
process.on('SIGTERM', () => handleSessionStop('SIGKILL'));
process.on('exit', () => child?.kill('SIGKILL'));

const dev = async (args: arg.Result<arg.Spec>) => {
  if (args['--help']) {
    logger.info(`
      Description
        Starts the application in development mode

      Usage
        $ rune dev -p <port number> -c <config file path>

      Options
        --config, -c                            config file path (default: rune.config.js)
        --help, -h                              Displays this message
    `);
    process.exit(0);
  }
  dir = getProjectDir('.');

  // Check if pages dir exists and warn if not
  if (!(await fileExists(dir, FileType.Directory))) {
    printAndExit(`> No such directory exists as the project root: ${dir}`);
  }

  const config = getConfig(args);

  const devServerOptions: StartServerOptions = {
    dir,
    isDev: true,
    config,
    ...(await getRuneConfig({ cwd: dir, config })),
  };

  process.title = devServerOptions.name ?? 'rune-server';

  async function startDevServer(options: StartServerOptions) {
    return new Promise<void>((resolve) => {
      if (!waitingChangeOrFirstStart) {
        return resolve();
      }

      waitingChangeOrFirstStart = false;

      let resolved = false;
      const defaultEnv = process.env;
      let NODE_OPTIONS = getNodeOptionsWithoutInspect();
      const nodeDebugType = checkNodeDebugType();
      const totalMem = os.totalmem();
      const totalMemInMB = Math.floor(totalMem / 1024 / 1024);
      NODE_OPTIONS = `${NODE_OPTIONS} --max-old-space-size=${Math.floor(totalMemInMB * 0.7)} --enable-source-maps`;
      const startServerPath = path.resolve(__dirname, '../lib/startServer');

      if (nodeDebugType) {
        NODE_OPTIONS = `${NODE_OPTIONS} --${nodeDebugType}=${getDebugPort() + 1}`;
      }

      child = fork(startServerPath, {
        stdio: 'inherit',
        env: {
          ...defaultEnv,
          NODE_OPTIONS,
        },
      });

      child.on('message', (msg: any) => {
        if (msg && typeof msg === 'object') {
          if (msg.workerReady) {
            child?.send({ workerOptions: options });
          } else if (msg.serverReady && !resolved) {
            resolved = true;
            resolve();
          }
        }
      });

      child.on('exit', async (code, signal) => {
        if (sessionStopHandled || signal) {
          return;
        }

        if (code === RESTART_EXIT_CODE) {
          waitingChangeOrFirstStart = true;
          return runDevServer();
        }

        await handleSessionStop(signal);
      });
    });
  }

  const runDevServer = async () => {
    try {
      await startDevServer(devServerOptions);
    } catch (err) {
      logger.error((err as Error)?.stack ?? err);
      process.exit(1);
    }
  };
  await runDevServer();
};

export { dev };
