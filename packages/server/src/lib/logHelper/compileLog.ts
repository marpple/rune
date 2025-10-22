import logger from './logger';
import { magenta, blue } from './picocolors';
import webpack from 'webpack';

export function compileLog(statsJson: webpack.StatsCompilation) {
  if (statsJson.publicPath) {
    logger.wait('publicPath:', statsJson.publicPath);
  }
  logger.wait('outputPath:', statsJson.outputPath);

  if (statsJson.assets) {
    const emittedAssets = statsJson.assets.filter((asset) => asset.emitted);
    if (emittedAssets.length > 0) {
      const publicFiles = emittedAssets.filter((asset) => asset.name.includes('public'));

      logger.wait(
        'assets[emitted]:',
        blue(
          emittedAssets
            .filter((asset) => !asset.name.includes('public'))
            .map((asset) => asset.name + `[${Math.round(asset.size / Math.pow(1024, 1))}KiB]`)
            .join(', ') +
            (publicFiles.length
              ? ', ' +
                `publicFiles[${publicFiles
                  .map((asset) => Math.round(asset.size / Math.pow(1024, 1)))
                  .reduce((a, b) => a + b, 0)}KiB]`
              : ''),
        ),
      );

      const totalSize = emittedAssets.reduce((acc, asset) => acc + asset.size, 0);
      const totalSizeInKiB = Math.round(totalSize / Math.pow(1024, 1));

      logger.wait('assets[emitted]:', magenta(totalSizeInKiB.toString()), 'KiB');
    }

    const errors = statsJson.errors;
    if (errors && errors.length > 0) {
      logger.wait(
        'errors:',
        blue(
          errors
            .map((error) => {
              return `\n${error.message}\n${error.file}\n${error.moduleName}`;
            })
            .join(', '),
        ),
      );
    }
  }

  logger.wait('time:', statsJson.time, 'ms' + '\n');
}
