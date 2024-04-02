import { app } from '@rune-ts/server';
import { ClientRouter } from '../app/ClientRouter';
import { TutorialLayout, type TutorialLayoutData } from '../app/TutorialLayout';
import runeConfig from '../../rune.config.js';
import { MeetupPage } from '../app/Meetup';

const server = app();

server.use((req, res, next) => {
  const layoutData: TutorialLayoutData = {
    __host_name: runeConfig.hostname || 'localhost',
    __bundle_port: runeConfig.port || Number(process.env.PORT) || 4000,
    title: '',
    description: '',
  };
  res.locals.layoutData = layoutData;
  next();
});

server.get(ClientRouter['/tutorials'].toString(), function (req, res) {
  res.locals.layoutData.title = '밋업';
  res.send(new TutorialLayout(res.locals.layoutData, ClientRouter['/tutorials']({})).toHtml());
});

server.get('/', (req, res) => {
  res.send('Hello, this is RUNE + RUNE Server!');
});
