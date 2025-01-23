import { app, type LayoutData, MetaView } from '@rune-ts/server';
import { ClientRouter } from '../app/ClientRouter';
import type { Todo } from '../app/todo';
import type { Setting } from '../app/setting';

const server = app();

server.get(ClientRouter['/todo'].toString(), function (req, res) {
  const layoutData: LayoutData = {
    head: {
      title: 'Todo App',
      description: '',
    },
  };

  res.locals.layoutData = layoutData;

  const todos: Todo[] = [
    { title: 'Coding', completed: false },
    { title: 'Dinner', completed: true },
    { title: 'Test', completed: false },
  ];

  const html = new MetaView(ClientRouter['/todo'](todos), res.locals.layoutData).toHtml();

  res.send(html);
});

server.get(ClientRouter['/setting'].toString(), function (req, res) {
  const layoutData: LayoutData = {
    head: {
      title: 'Setting App',
      description: '',
    },
  };

  res.locals.layoutData = layoutData;

  const settings: Setting[] = [
    { title: 'Wifi', on: true },
    { title: 'Bluetooth', on: false },
    { title: 'AirDrop', on: true },
  ];

  console.log(settings);

  const html = new MetaView(ClientRouter['/setting'](settings), res.locals.layoutData).toHtml();

  res.send(html);
});

server.get('/', (req, res) => {
  res.send('Hello, this is RUNE + RUNE Server!');
});
