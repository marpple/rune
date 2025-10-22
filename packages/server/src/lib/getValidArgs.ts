import { printAndExit } from './util';
import arg from 'arg';

export function getValidatedArgs(validArgs: arg.Spec, argv?: string[]) {
  let args: arg.Result<arg.Spec>;

  try {
    args = arg(validArgs, { argv });
  } catch (e: any) {
    if (e.code === 'ARG_UNKNOWN_OPTION') {
      printAndExit(e.message, 1);
    }
    throw e;
  }

  return args;
}
