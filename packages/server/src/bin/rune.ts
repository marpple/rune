#!/usr/bin/env node

import { commands } from '../lib/commands';
import { commandArgs } from '../lib/commandArgs';
import { getValidatedArgs } from '../lib/getValidArgs';
import arg from 'arg';
import logger from '../lib/logHelper/logger';
import { getConfig } from '../lib/util';
import { loadEnv } from '../server';
import { blue, bold } from '../lib/logHelper/picocolors';
import { version } from '../../package.json';

/*
 * rune [subcommand] 뒤에 오는 arguments를 설정
 * permissive는 다른 arguments가 들어오더라도 오류가 일어나지 않음
 * */
const args = arg(
  {
    // Types
    '--version': Boolean,
    '--help': Boolean,
    '--inspect': Boolean,

    // Aliases
    '-v': '--version',
    '-h': '--help',
  },
  {
    permissive: true,
  },
);

logger.ready(blue(bold(`Rune Server v${version}`)));
if (args['--version']) {
  process.exit(0);
}

/*
 * rune [subcommand] 시 subcommand가 없고 --help argument가 있으면 밑에 로직이 실행 후 종료
 * */
const foundCommand = Boolean(commands[args._[0]]);

if (!foundCommand && args['--help']) {
  logger.info(`
    Usage
      $ rune <command>

    Available commands
      ${Object.keys(commands).join(', ')}

    Options
      --help, -h      Displays this message
  `);
  process.exit(0);
}

// Start performance profiling after Node.js version is checked
if (global.performance) performance.mark('rune-start');

const defaultCommand = 'dev';
const command = foundCommand ? args._[0] : defaultCommand;
const forwardedArgs = foundCommand ? args._.slice(1) : args._;

// Make sure the `next <subcommand> --help` case is covered
if (args['--help']) {
  forwardedArgs.push('--help');
}

const defaultEnv = command === 'dev' ? 'development' : 'production';

const standardEnv = ['production', 'development', 'staging'];

if (process.env.NODE_ENV) {
  const isNotStandard = !standardEnv.includes(process.env.NODE_ENV);
  const shouldWarnCommands =
    process.env.NODE_ENV === 'development' ? ['start', 'build'] : process.env.NODE_ENV === 'production' ? ['dev'] : [];

  if (isNotStandard || shouldWarnCommands.includes(command)) {
    logger.warn('Warning: The NODE_ENV environment variable is not set to "development" or "production" or "staging".');
  }
}

(process.env as any).NODE_ENV = process.env.NODE_ENV ?? defaultEnv;

if (command === 'build') {
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT', () => process.exit(0));
}

async function main() {
  const currentArgsSpec = commandArgs[command]();
  const validatedArgs = getValidatedArgs(currentArgsSpec, forwardedArgs);

  await loadEnv(getConfig(validatedArgs));

  for (const dependency of ['express']) {
    try {
      require.resolve(dependency);
    } catch (err) {
      logger.warn(
        `The module '${dependency}' was not found. rune.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'pnpm install or link ${dependency}'`,
      );
    }
  }

  const commandFunction = await commands[command]();

  await commandFunction(validatedArgs);
  if (command === 'build') {
    // ensure process exits after build completes so open handles/connections
    // don't cause process to hang
    process.exit(0);
  }
}

main().catch((err) => {
  logger.error(err);
});
