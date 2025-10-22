import express, { type Express } from 'express';
import EventEmitter from 'events';
import { setGlobal } from '../../shared/global';
import logger from '../../lib/logHelper/logger';
import morgan from 'morgan';

type event = 'connect' | 'close';
export interface RuneServer extends Express {
  onEvent: (event: event, callback: () => void) => void;
  settings: {
    rune: true;
    time: number;
    count: number;
  } & Record<any, any>;
}
export const rune_emitter = new EventEmitter();
export let rune_app: RuneServer | null;
export let rune_closed = false;
export let rune_count = 1;

export const setClosed = (close: boolean) => {
  rune_closed = close;
};

rune_emitter.on('closed', () => {
  setClosed(false);
});

const closeHandler = (callback: () => Promise<void> | void) => async () => {
  if (rune_closed) return;

  setClosed(true);
  setGlobal('morgan_active', false);
  try {
    rune_app = null;
    await callback();
  } catch (e) {
    logger.error(e);
  } finally {
    rune_emitter.emit('closed');
    rune_emitter.removeAllListeners('close');
  }
};

const openHandler = (callback: () => Promise<void> | void) => async () => {
  try {
    await callback();
  } catch (e) {
    logger.error(e);
  } finally {
    rune_emitter.removeAllListeners('connect');
  }
};

export const app = (): RuneServer => {
  const expressApp = express();

  expressApp.settings.rune = true;
  expressApp.settings.time = new Date().getTime();
  expressApp.settings.count = rune_count++;

  const app: RuneServer = Object.assign(expressApp, {
    onEvent(event: event, callback: () => Promise<void> | void) {
      if (event === 'close') {
        rune_emitter.addListener(event, closeHandler(callback));
      } else if (event === 'connect') {
        rune_emitter.addListener(event, openHandler(callback));
      }
    },
  });

  rune_app = app;

  return app;
};
