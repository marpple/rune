import type arg from 'arg';

export const validArgs: arg.Spec = {
  // Types
  '--help': Boolean,
  '--config': String,

  // Aliases
  '-h': '--help',
  '-c': '--config',
};
