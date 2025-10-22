import type { getValidatedArgs } from './getValidArgs';

export type CliCommand = (args: ReturnType<typeof getValidatedArgs>) => void;

export const commandArgs: Record<string, () => Parameters<typeof getValidatedArgs>[0]> = {
  start: () => require('../cli/startArgs').validArgs,
  build: () => require('../cli/buildArgs').validArgs,
  dev: () => require('../cli/devArgs').validArgs,
};
