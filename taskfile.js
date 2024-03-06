export async function core_esm(task, opts) {
  await task
    .source('src/**/*.+(js|ts)', {
      ignore: ['src/**/{amp,config}.+(js|ts)'],
    })
    .swc('client', { dev: opts.dev, esm: true })
    .target('dist/esm');
}

export async function core(task, opts) {
  await task
    .source('src/**/*.+(js|ts)', {
      ignore: ['src/**/{amp,config}.+(js|ts)'],
    })
    .swc('client', { dev: opts.dev })
    .target('dist');
}

export async function build(task, opts) {
  await task.clear('dist').parallel(['core', 'core_esm'], opts);
}

export default async function (task) {
  const opts = { dev: true };
  await task.watch('src', ['core', 'core_esm'], opts);
}
