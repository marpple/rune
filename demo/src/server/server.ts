import { app } from '@rune-ts/server';
import { ClientRouter } from '../app/ClientRouter';
import { type MarppleShopLayoutData } from '../app/MarppleShopLayout';
import runeConfig from '../../rune.config.js';

const server = app();

server.use((req, res, next) => {
  const layoutData: MarppleShopLayoutData = {
    __host_name: runeConfig.hostname || 'localhost',
    __bundle_port: runeConfig.port || Number(process.env.PORT) || 4000,
    title: '',
    description: '',
  };
  res.locals.layoutData = layoutData;
  next();
});

server.get(ClientRouter['/tutorials'].toString(), function (req, res) {
  res.locals.layoutData.title = '상품상세';
  res.send(ClientRouter['/tutorials']({}, res.locals.layoutData).toHtml());
});

server.get('/', (req, res) => {
  res.send('Hello, this is RUNE + RUNE Server!');
});
