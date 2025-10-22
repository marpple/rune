import path from 'path';
import { realpathSync } from './realPath';

export function getProjectDir(dir?: string) {
  try {
    const resolvedDir = path.resolve(dir || '.');
    const realDir = realpathSync(resolvedDir);

    if (resolvedDir !== realDir && resolvedDir.toLowerCase() === realDir.toLowerCase()) {
      console.warn(`Invalid casing detected for project dir, received ${resolvedDir} actual path ${realDir}`);
    }

    return realDir;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error(`Invalid project directory provided, no such directory: ${path.resolve(dir ?? '.')}`);
      process.exit(1);
    }
    throw err;
  }
}
