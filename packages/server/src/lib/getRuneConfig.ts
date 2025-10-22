import path from 'path';
import type { RuneConfigType } from '../types/rune';

export async function getRuneConfig({ cwd, config }: { cwd: string; config: string }): Promise<RuneConfigType> {
  const configuration = (await import(path.resolve(cwd, `${config}?date=${new Date().getTime()}`)))
    .default as RuneConfigType;

  const parsed = process.env.PORT && parseInt(process.env.PORT, 10);
  const env_port = typeof parsed === 'number' && !Number.isNaN(parsed) ? parsed : 3000;
  const env_hostname = process.env.HOST;

  const defaultConfig: RuneConfigType = {
    name: 'rune',
    port: env_port,
    hostname: env_hostname,
    watchToReloadPaths: [],
    mode: 'render',
    envFiles: [],
    morganSkipPaths: [],
  };

  if (!configuration) {
    return defaultConfig;
  }

  return { ...defaultConfig, ...configuration } as RuneConfigType;
}
