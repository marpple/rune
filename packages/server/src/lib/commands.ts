import type { getValidatedArgs } from './getValidArgs';

export type CliCommand = (args: ReturnType<typeof getValidatedArgs>) => void;

export const commands: Record<string, () => Promise<CliCommand>> = {
  start: () => Promise.resolve(require('../cli/start').start),
  build: () => Promise.resolve(require('../cli/build').build),
  dev: () => Promise.resolve(require('../cli/dev').dev),
};
