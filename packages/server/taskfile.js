export async function bin(task, opts) {
  await task
    .source('src/bin/*')
    .swc('server', { stripExtension: true, dev: opts.dev })
    .target('dist/bin', { mode: '0755' });
}

export async function cli(task, opts) {
  await task.source('src/cli/**/*.+(js|ts)').swc('server', { dev: opts.dev }).target('dist/cli');
}

export async function lib(task, opts) {
  await task.source('src/lib/**/!(*.test).+(js|ts|json)').swc('client', { dev: opts.dev }).target('dist/lib');
}

export async function lib_esm(task, opts) {
  await task
    .source('src/lib/**/!(*.test).+(js|ts|json)')
    .swc('client', { dev: opts.dev, esm: true })
    .target('dist/esm/lib');
}

export async function server(task, opts) {
  await task
    .source('src/server/**/*.+(js|ts)', {
      ignore: ['src/server/**/{amp,config}.+(js|ts)'],
    })
    .swc('server', { dev: opts.dev })
    .target('dist/server');
}

export async function server_esm(task, opts) {
  await task
    .source('src/server/**/*.+(js|ts)', {
      ignore: ['src/server/**/{amp,config}.+(js|ts)'],
    })
    .swc('server', { dev: opts.dev, esm: true })
    .target('dist/esm/server');
}

export async function shared(task, opts) {
  await task
    .source('src/shared/**/*.+(js|ts)', {
      ignore: ['src/shared/**/{amp,config}.+(js|ts)'],
    })
    .swc('client', { dev: opts.dev })
    .target('dist/shared');
}

export async function shared_esm(task, opts) {
  await task
    .source('src/shared/**/*.+(js|ts)', {
      ignore: ['src/shared/**/{amp,config}.+(js|ts)'],
    })
    .swc('client', { dev: opts.dev, esm: true })
    .target('dist/esm/shared');
}

export async function client_esm(task, opts) {
  await task
    .source('src/client/**/*.+(js|ts)', {
      ignore: ['src/client/**/{amp,config}.+(js|ts)'],
    })
    .swc('client', { dev: opts.dev, esm: true })
    .target('dist/esm/client');
}

export async function client(task, opts) {
  await task
    .source('src/client/**/*.+(js|ts)', {
      ignore: ['src/client/**/{amp,config}.+(js|ts)'],
    })
    .swc('client', { dev: opts.dev })
    .target('dist/client');
}

export async function api(task, opts) {
  await task
    .source('src/api/**/*.+(js|ts)', {
      ignore: ['src/api/**/{amp,config}.+(js|ts)'],
    })
    .swc('server', { dev: opts.dev })
    .target('dist/api');
}

export async function api_esm(task, opts) {
  await task
    .source('src/api/**/*.+(js|ts)', {
      ignore: ['src/api/**/{amp,config}.+(js|ts)'],
    })
    .swc('server', { dev: opts.dev, esm: true })
    .target('dist/esm/api');
}

export async function build(task, opts) {
  await task
    .clear('dist')
    .parallel(
      [
        'bin',
        'cli',
        'lib',
        'lib_esm',
        'shared',
        'shared_esm',
        'client',
        'client_esm',
        'api',
        'api_esm',
        'server',
        'server_esm',
      ],
      opts,
    );
}

export default async function (task) {
  const opts = { dev: true };
  await task.start('build', opts);
  await task.watch('src/bin', 'bin', opts);
  await task.watch('src/lib', ['lib', 'lib_esm'], opts);
  await task.watch('src/cli', 'cli', opts);
  await task.watch('src/shared', ['shared', 'shared_esm'], opts);
  await task.watch('src/client', ['client', 'client_esm'], opts);
  await task.watch('src/api', ['api', 'api_esm'], opts);
  await task.watch('src/server', ['server', 'server_esm'], opts);
}
