import logger from './logHelper/logger';
import { getServer } from './getServer';
import { type RuneServer, setClientManifest } from '../server';
import express from 'express';

let rune_app: RuneServer | null | undefined = undefined;

const startRenderServer = async ({ path }: { path: string }) => {
  if (rune_app) rune_app = null;
  rune_app = await getServer(path);
};

const startServer = ({ port, name }: { path: string; port: number; name: string }) => {
  process.title = (name ?? 'rune-server') + '-render';
  const rune_server = express();
  rune_server.use(async (req, res, next) => {
    if (!rune_app) {
      return res.status(503).send('Server is starting up. Please wait.');
    }

    try {
      await rune_app(req, res, next);
    } catch (e) {
      res.status(500).send(e || 'Internal server error');
    }
  });

  const server = rune_server.listen(port + 12000);
  process.on('exit', () => {
    server.close();
    process.exit(0);
  });
};

const exitProcess = (err) => {
  logger.error(err?.stack ?? err);
  logger.error('Server failed.');
  process.exit(0);
};

process.on('uncaughtException', exitProcess);
process.on('unhandledRejection', exitProcess);

if (process.send) {
  process.addListener('message', async (msg: any) => {
    if (msg && typeof msg && msg.workerOptions && process.send) {
      startServer(msg.workerOptions);
      await startRenderServer(msg.workerOptions);
      if (process.send) {
        process.send({ serverStarted: new Date().getTime() });
      }
    }

    if (msg && typeof msg && msg.clientOutputPath && process.send) {
      setClientManifest(msg.clientOutputPath);
    }

    if (msg && typeof msg && msg.serverOutputPath && process.send) {
      await startRenderServer({ path: msg.serverOutputPath });
      if (process.send) {
        process.send({ serverStarted: new Date().getTime() });
      }
    }
  });
}
