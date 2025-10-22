import { type ChildProcess, fork } from 'child_process';
import { once } from 'events';
import Express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import v8 from 'v8';
import { type Configuration } from 'webpack';
import { serverManifest, setServerManifest } from '../server';
import { clientConfigs, serverConfigs } from './baseWebpackConfig';
import logger from './logHelper/logger';
import type { StartServerOptions } from './startServer';
import { checkNodeDebugType, getDebugPort, getNodeOptionsWithoutInspect, RESTART_EXIT_CODE } from './util';

let renderServerProcess: undefined | ChildProcess;
let serverBundleProcess: undefined | ChildProcess;
let clientBundleProcess: undefined | ChildProcess;
let sessionStopHandled = false;

const makeEnv = (inspect_port: number) => {
  const defaultEnv = process.env;
  let NODE_OPTIONS = getNodeOptionsWithoutInspect();
  const nodeDebugType = checkNodeDebugType();

  if (nodeDebugType) {
    NODE_OPTIONS = `${NODE_OPTIONS} --${nodeDebugType}=${getDebugPort() + 1 + inspect_port}`;
  }

  return {
    ...defaultEnv,
    NODE_OPTIONS,
  };
};

const makeRenderServerProcess = (option: { path: string; port: number; name: string }) => {
  const startRenderServerPath = path.resolve(__dirname, './startRenderServer');

  renderServerProcess = fork(startRenderServerPath, {
    stdio: 'inherit',
    env: makeEnv(1),
  });

  return () => {
    if (renderServerProcess) renderServerProcess.send({ workerOptions: option });
  };
};
const makeServerBundleProcess = (option: StartServerOptions) => {
  const startServerBundleServerPath = path.resolve(__dirname, './devServerBundler');

  serverBundleProcess = fork(startServerBundleServerPath, {
    stdio: 'inherit',
    env: makeEnv(2),
  });

  serverBundleProcess.send({ workerOptions: option });

  return serverBundleProcess;
};
const makeClientBundleProcess = (option: StartServerOptions) => {
  const startClientBundleServerPath = path.resolve(__dirname, './devClientBundler');

  clientBundleProcess = fork(startClientBundleServerPath, {
    stdio: 'inherit',
    env: makeEnv(3),
  });

  clientBundleProcess.send({ workerOptions: option });

  return clientBundleProcess;
};

const handleSessionStop = async (signal: NodeJS.Signals | number | null) => {
  if (renderServerProcess?.pid) renderServerProcess.kill(signal ?? 0);
  if (clientBundleProcess?.pid) clientBundleProcess.kill(signal ?? 0);
  if (serverBundleProcess?.pid) serverBundleProcess.kill(signal ?? 0);
  if (sessionStopHandled) return;
  sessionStopHandled = true;

  if (renderServerProcess?.pid && renderServerProcess.exitCode === null && renderServerProcess.signalCode === null) {
    await once(renderServerProcess, 'exit').catch(() => {});
  }

  if (clientBundleProcess?.pid && clientBundleProcess.exitCode === null && clientBundleProcess.signalCode === null) {
    await once(clientBundleProcess, 'exit').catch(() => {});
  }

  if (serverBundleProcess?.pid && serverBundleProcess.exitCode === null && serverBundleProcess.signalCode === null) {
    await once(serverBundleProcess, 'exit').catch(() => {});
  }

  process.exit(0);
};

process.on('SIGINT', () => handleSessionStop('SIGKILL'));
process.on('SIGTERM', () => handleSessionStop('SIGKILL'));
process.on('exit', () => {
  renderServerProcess?.kill('SIGKILL');
  clientBundleProcess?.kill('SIGKILL');
  serverBundleProcess?.kill('SIGKILL');
});

let client_config: undefined | Configuration;

export const devServerBundler = async (serverOptions: StartServerOptions, server: Express.Express) => {
  if (serverOptions.mode === 'render') {
    const options = {
      target: `http://0.0.0.0:${serverOptions.port + 10000}/static`,
      pathRewrite: {},
    };

    const proxy = createProxyMiddleware(options);
    server.use('/static', proxy);
    makeClientBundleProcess(serverOptions);
    client_config = clientConfigs(serverOptions);
  }

  const options = {
    target: `http://0.0.0.0:${serverOptions.port + 12000}/`,
    pathRewrite: {},
  };

  const proxy = createProxyMiddleware(options);
  server.use(async (req, res, next) => {
    if (!renderServerProcess) {
      return res.status(503).send('Server is starting up. Please wait.');
    }

    try {
      await proxy(req, res, next);
    } catch (e) {
      res.status(500).send(e || 'Internal server error');
    } finally {
      if (v8.getHeapStatistics().used_heap_size > 0.5 * v8.getHeapStatistics().heap_size_limit) {
        logger.warn(`Server is approaching the used memory threshold, restarting...`);
        process.exit(RESTART_EXIT_CODE);
      }
    }
  });

  makeServerBundleProcess(serverOptions);
  const server_config = serverConfigs(serverOptions);

  let start_time = new Date().getTime();
  let end_time = new Date().getTime();

  await Promise.all([
    new Promise<void>((res) => {
      if (serverOptions.mode === 'render' && clientBundleProcess) {
        clientBundleProcess.once('message', (msg: any) => {
          if (msg && typeof msg === 'object' && msg.beforeCompile) {
            start_time = msg.beforeCompile;
            res();
          }
        });
      } else {
        res();
      }
    }),
    new Promise<void>((res) => {
      if (serverBundleProcess) {
        serverBundleProcess.once('message', (msg: any) => {
          if (msg && typeof msg === 'object' && msg.beforeCompile) {
            start_time = msg.beforeCompile;
            res();
          }
        });
      }
    }),
  ]);

  await Promise.all([
    new Promise<void>((res) => {
      if (serverOptions.mode === 'render' && clientBundleProcess) {
        clientBundleProcess.once('message', (msg: any) => {
          if (msg && typeof msg === 'object' && msg.done) {
            res();
          }
        });
      } else {
        res();
      }
    }),
    new Promise<void>((res) => {
      if (serverBundleProcess) {
        serverBundleProcess.once('message', (msg: any) => {
          if (msg && typeof msg === 'object' && msg.done) {
            res();
          }
        });
      }
    }),
  ]);

  await new Promise<void>((res) => {
    if (server_config.output?.path) {
      setServerManifest(server_config.output?.path);
      const rune_file_path = path.resolve(server_config.output?.path, serverManifest[`main.js`]);
      const start = makeRenderServerProcess({
        path: rune_file_path,
        port: serverOptions.port,
        name: serverOptions.name,
      });

      if (renderServerProcess?.connected && client_config) {
        renderServerProcess.send({ clientOutputPath: client_config.output?.path });
      }

      if (renderServerProcess?.connected) {
        renderServerProcess.once('message', (msg: any) => {
          if (msg && typeof msg === 'object' && msg.serverStarted) {
            end_time = msg.serverStarted;
            res();
          }
        });
      }

      start();
    } else {
      res();
    }
  });

  logger.event('Rune Server Ready', end_time - start_time + 'ms');

  if (serverBundleProcess) {
    const renderServerMessageHandler = (msg: any) => {
      if (msg && typeof msg === 'object' && msg.serverStarted) {
        end_time = msg.serverStarted;
        logger.event('Rune Server Ready', end_time - start_time + 'ms');
      }
    };

    let queue: number[] = [];

    serverBundleProcess.on('message', (msg: any) => {
      if (msg && typeof msg === 'object' && msg.beforeCompile) {
        start_time = msg.beforeCompile;
        queue.push(start_time);
        return;
      }

      if (server_config?.output?.path && msg && typeof msg === 'object' && msg.done) {
        if (start_time !== queue[queue.length - 1]) {
          return;
        }

        queue = [];
        setServerManifest(server_config.output?.path);
        const rune_file_path = path.resolve(server_config.output?.path, serverManifest[`main.js`]);

        if (renderServerProcess?.connected) {
          if (serverOptions.processReload) {
            renderServerProcess.kill(1);
            renderServerProcess.disconnect();

            renderServerProcess.on('exit', async () => {
              makeRenderServerProcess({
                path: rune_file_path,
                port: serverOptions.port,
                name: serverOptions.name,
              })();

              if (renderServerProcess?.connected) {
                renderServerProcess.once('message', renderServerMessageHandler);
              }

              if (renderServerProcess && client_config) {
                renderServerProcess.send({ clientOutputPath: client_config.output?.path });
              }
            });
          } else {
            renderServerProcess.removeListener('message', renderServerMessageHandler);
            renderServerProcess.send({ serverOutputPath: rune_file_path });
            renderServerProcess.once('message', renderServerMessageHandler);
          }
        } else {
          const start = makeRenderServerProcess({
            path: rune_file_path,
            port: serverOptions.port,
            name: serverOptions.name,
          });

          if (renderServerProcess && client_config) {
            renderServerProcess.send({ clientOutputPath: client_config.output?.path });
          }

          start();

          if (renderServerProcess?.connected) {
            renderServerProcess.once('message', renderServerMessageHandler);
          }
        }
      }
    });

    if (clientBundleProcess) {
      let start_client_bundle_time = new Date().getTime();
      let end_client_bundle_time = new Date().getTime();

      clientBundleProcess.on('message', (msg: any) => {
        if (msg && typeof msg === 'object' && msg.beforeCompile) {
          start_client_bundle_time = msg.beforeCompile;
        }

        if (
          renderServerProcess?.connected &&
          client_config?.output?.path &&
          msg &&
          typeof msg === 'object' &&
          msg.done
        ) {
          end_client_bundle_time = msg.done;
          logger.event('Rune Server Client Ready', end_client_bundle_time - start_client_bundle_time + 'ms');
          renderServerProcess.send({ clientOutputPath: client_config.output?.path });
        }
      });
    }
  }
};
