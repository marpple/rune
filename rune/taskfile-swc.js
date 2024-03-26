// taskr babel plugin with Babel 7 support
// https://github.com/lukeed/taskr/pull/305

const MODERN_BROWSERSLIST_TARGET = ['chrome 64', 'edge 79', 'firefox 67', 'opera 51', 'safari 12'];

const path = require('path');

const transform = require('@swc/core').transform;

module.exports = function (task) {
  // eslint-disable-next-line require-yield
  task.plugin(
    'swc',
    {},
    function* (
      file,
      serverOrClient,
      {
        stripExtension,
        keepImportAttributes = false,
        interopClientDefaultExport = false,
        esm = false,
      } = {},
    ) {
      // Don't compile .d.ts
      if (file.base.endsWith('.d.ts') || file.base.endsWith('.json')) return;

      const isClient = serverOrClient === 'client';
      /** @type {import('@swc/core').Options} */
      const swcClientOptions = {
        module: esm
          ? {
              type: 'es6',
            }
          : {
              type: 'commonjs',
              ignoreDynamic: true,
              exportInteropAnnotation: true,
            },
        env: {
          targets: MODERN_BROWSERSLIST_TARGET,
        },
      };

      /** @type {import('@swc/core').Options} */
      const swcServerOptions = {
        minify: false,
        module: esm
          ? {
              type: 'es6',
            }
          : {
              type: 'commonjs',
              ignoreDynamic: true,
              exportInteropAnnotation: true,
            },
        env: {
          targets: {
            // Ideally, should be same version defined in packages/next/package.json#engines
            // Currently a few minors behind due to babel class transpiling
            // which fails "test/integration/mixed-ssg-serverprops-error/test/index.test.js"
            node: '14',
          },
        },
      };

      const swcOptions = isClient ? swcClientOptions : swcServerOptions;

      const filePath = path.join(file.dir, file.base);
      const fullFilePath = path.join(__dirname, filePath);
      const distFilePath = path.dirname(
        // we must strip src from filePath as it isn't carried into
        // the dist file path
        path.join(__dirname, 'dist', filePath.replace(/^src[/\\]/, '')),
      );

      const options = {
        filename: path.join(file.dir, file.base),
        sourceMaps: true,
        inlineSourcesContent: false,
        sourceFileName: path.relative(distFilePath, fullFilePath),

        ...swcOptions,
      };

      const source = file.data.toString();
      const output = yield transform(source, options);
      const ext = path.extname(file.base);

      // Replace `.ts|.tsx` with `.js` in files with an extension
      if (ext) {
        const extRegex = new RegExp(ext.replace('.', '\\.') + '$', 'i');
        // Remove the extension if stripExtension is enabled or replace it with `.js`
        file.base = file.base.replace(
          extRegex,
          stripExtension ? '' : `.${ext === '.mts' ? 'm' : ''}js`,
        );
      }

      if (output.map) {
        if (interopClientDefaultExport && !esm) {
          output.code += `
if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}
`;
        }

        const map = `${file.base}.map`;

        this._.files.push({
          base: map,
          dir: file.dir,
          data: Buffer.from(output.map),
        });
      }

      file.data = Buffer.from(output.code);
    },
  );
};
