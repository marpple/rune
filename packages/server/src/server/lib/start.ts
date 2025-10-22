import type arg from 'arg';
import { getProjectDir } from '../../lib/getProjectDir';
import { getRuneConfig } from '../../lib/getRuneConfig';
import { config } from 'dotenv';
import path from 'path';

export const loadEnv = async (runeConfigPath: string) => {
  const dir = getProjectDir('.');
  const runeConfig = await getRuneConfig({ cwd: dir, config: runeConfigPath });

  config({
    override: true,
    path: runeConfig.envFiles ? runeConfig.envFiles.map((file) => path.resolve(dir, file)) : [],
  });
};

export const startServer = async (runeConfigPath: string) => {
  await loadEnv(runeConfigPath);

  const { start } = await import('../../cli/start.js');
  const arg = {} as arg.Result<arg.Spec>;

  return start(arg, runeConfigPath);
};
