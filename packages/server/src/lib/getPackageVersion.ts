import fs from 'fs';
import * as path from 'path';

interface PackageJsonDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

let cachedDeps: PackageJsonDependencies;

export function getDependencies({ cwd }: { cwd: string }): PackageJsonDependencies {
  if (cachedDeps) {
    return cachedDeps;
  }

  return (cachedDeps = (() => {
    const configurationPath: string | undefined = path.resolve(cwd, 'package.json');
    if (!configurationPath) {
      return { dependencies: {}, devDependencies: {} };
    }

    const content = fs.readFileSync(configurationPath, 'utf-8');
    const packageJson: any = JSON.parse(content);

    const { dependencies = {}, devDependencies = {} } = packageJson || {};
    return { dependencies, devDependencies };
  })());
}

export async function getPackageVersion({ cwd, name }: { cwd: string; name: string }): Promise<string | null> {
  const { dependencies, devDependencies } = await getDependencies({ cwd });
  if (!(dependencies[name] || devDependencies[name])) {
    return null;
  }

  const cwd2 = cwd.endsWith(path.posix.sep) || cwd.endsWith(path.win32.sep) ? cwd : `${cwd}/`;

  try {
    const targetPath = require.resolve(`${name}/package.json`, {
      paths: [cwd2],
    });
    const targetContent = fs.readFileSync(targetPath, 'utf-8');
    return JSON.parse(targetContent).version ?? null;
  } catch {
    return null;
  }
}

export function getPackageType({ cwd }: { cwd: string }): string | null {
  try {
    const packageJsonPath = './package.json';

    const targetContent = fs.readFileSync(path.resolve(cwd, packageJsonPath), 'utf8');
    return JSON.parse(targetContent).type ?? null;
  } catch {
    return null;
  }
}
