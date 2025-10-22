import { bold, green, magenta, red, yellow, white, blue } from './picocolors';

export const prefixes = {
  wait: white(bold('○')),
  error: red(bold('⨯')),
  warn: yellow(bold('⚠')),
  ready: blue(bold('▲')),
  info: white(bold(' ')),
  event: green(bold('✓')),
  trace: magenta(bold('»')),
} as const;

const LOGGING_METHOD = {
  log: 'log',
  warn: 'warn',
  error: 'error',
} as const;

function prefixedLog(prefixType: keyof typeof prefixes, ...message: any[]) {
  if ((message[0] === '' || message[0] === undefined) && message.length === 1) {
    message.shift();
  }

  const consoleMethod: keyof typeof LOGGING_METHOD =
    prefixType in LOGGING_METHOD ? LOGGING_METHOD[prefixType as keyof typeof LOGGING_METHOD] : 'log';

  const prefix = prefixes[prefixType];

  // If there's no message, don't print the prefix but a new line
  if (message.length === 0) {
    console[consoleMethod]('');
  } else {
    console[consoleMethod](' ' + prefix, ...message);
  }
}

function bootstrap(...message: any[]) {
  console.log(' ', ...message);
}

function wait(...message: any[]) {
  prefixedLog('wait', ...message);
}

function error(...message: any[]) {
  prefixedLog('error', ...message);
}

function warn(...message: any[]) {
  prefixedLog('warn', ...message);
}

function ready(...message: any[]) {
  prefixedLog('ready', ...message);
}

function info(...message: any[]) {
  prefixedLog('info', ...message);
}

function event(...message: any[]) {
  prefixedLog('event', ...message);
}

function trace(...message: any[]) {
  prefixedLog('trace', ...message);
}

const warnOnceMessages = new Set();
function warnOnce(...message: any[]) {
  if (!warnOnceMessages.has(message[0])) {
    warnOnceMessages.add(message.join(' '));

    warn(...message);
  }
}

export default {
  bootstrap,
  wait,
  error,
  warn,
  ready,
  info,
  event,
  trace,
  warnOnce,
};
