# GETTING STARTED

## Install

```shell
pnpm add -D @types/express @types/express-serve-static-core
pnpm add @rune-ts/server @swc/core

npm install -D @types/express @types/express-serve-static-core
npm install @swc/core @rune-ts/server

pnpm add @rune-ts/server --global
npm install @rune-ts/server --global
```

- If you install this into global store, you can execute rune directly.

## Usage

### rune cli

```json
{
  "dev": "pnpm rune dev",
  "build": "pnpm rune build",
  "start": "pnpm rune start -c rune.prod.config.js"
}
```

- All commands support -h and --help flag, allowing you to access the help description.

### rune.config.js Setting Example

- Check the detailed properties in import('@rune-ts/server').RuneConfigType

```js
/**
 * @type {import('@rune-ts/server').RuneConfigType}
 */
module.exports = {
  port: 4000,
  hostname: 'localhost',
  mode: 'render',
  watchToReloadPaths: ['../../../packages'],
  clientEntry: './src/app/client/index.ts',
  serverEntry: './src/app/server/index.ts',
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/app/client')],
    additionalData: `@import "base";`,
  },
  showBundleAnalyzer: false,
  internalModules: [/@packages\/*\w+/, '@marpple/rune-ui'],
};
```

### server method description

```ts
import { app } from '@rune-ts/server';

const server = app();
```

- After the initial setup for Rune Server Execution. the returned `express.Application` includes an `onEvent` method.

```ts
server.onEvent('connect', () => {
  console.log('Turn On');
});

server.onEvent('close', () => {
  console.log('Turn Off');
});
```

- `onEvent` method execute a function after trigger event `close` and `connect` like above example.

```ts
import { createRouter } from '@rune-ts/server';
import { html, Page } from 'rune-ts';

class HelloWorldPage extends Page<{ title: string }> {
  override template({ title }) {
    return html` <div>hello, world: ${title}</div> `;
  }
}

const homeRouter = {
  ['/']: HelloWorldPage,
};

class HelloRunePage extends Page<{ title: string }> {
  override template({ title }) {
    return html` <div>hello, rune: ${title}</div> `;
  }
}

const runeRouter = {
  ['/rune']: HelloRunePage,
};

type Router = typeof homeRouter & typeof runeRouter;

const routers = createRouter<Router>({
  ...homeRouter,
  ...runeRouter,
});
```
**createRouter** is a function that makes { key: View(rune-ts) } object\
and makes a function which returns instance of View.\
then changes function's toString return value to router's key.\
and instance of View has key property and value which are a router's key.


```ts
import { app } from '@rune-ts/server';
import { MetaView } from '@rune-ts/server';

const server = app();

server.get(routers['/'].toString(), function (req, res) {
  const layoutData: LayoutData = {
    head: {
      title: 'HOME',
      description: 'sss',
    },
  };
  res.send(new MetaView(routers['/']({ name: '', price: 100 }), layoutData).toHtml());
});
```

- it is an example of createRouter and MetaView. 
- MetaView is View for SSR. 
- it has many options. please check the type for those options.

### client method description

```ts
import { hydrate } from '@rune-ts/server';

import { routers } from '../router';

hydrate(routers);
```

- if you are using server-side rendering with MetaView or the toHtmlSRR() function of Page, 
- you can hydrate by hydration function.
