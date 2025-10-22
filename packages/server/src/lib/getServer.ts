import { rune_app, rune_emitter } from '../server';

export const getServer = async (serverFilePath: string) => {
  try {
    const start = new Date().getTime();
    await import(`${serverFilePath}?date=${start}`);
    rune_emitter.emit('connect');
    return rune_app;
  } catch (e) {
    console.error(e);
  }
};

export const getProdServer = async (serverFilePath: string) => {
  try {
    await import(serverFilePath);
    rune_emitter.emit('connect');
    return rune_app;
  } catch (e) {
    console.error(e);
  }
};
