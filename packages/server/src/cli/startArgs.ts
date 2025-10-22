import type arg from 'arg';

export const validArgs: arg.Spec = {
  // Types
  '--help': Boolean,
  '--port': Number,
  '--hostname': String,
  '--config': String,

  // Aliases
  '-h': '--help',
  '-p': '--port',
  '-H': '--hostname',
  '-c': '--config',
};
