import React from 'react';
import {
  Action,
  ActionBar,
  ActionInitializer,
  Application,
  Plugin,
  SchemaComponent,
  SchemaComponentProvider,
  SchemaInitializer,
} from '@nocobase/client';
import { uid } from '@formily/shared';
import { ISchema } from '@formily/react';

const addActionButton = new SchemaInitializer({
  name: 'AddActionButton',
  designable: true,
  title: 'Configure actions',
  style: {
    marginLeft: 8,
  },
  items: [
    {
      type: 'itemGroup',
      title: 'Enable actions',
      name: 'enable-actions',
      children: [
        {
          name: 'action-1',
          title: '{{t("Action 1")}}',
          Component: 'ActionInitializer',
          schema: {
            title: 'Action 1',
            'x-component': 'Action',
            'x-action': 'action1', // x-action，按钮的唯一标识（在 action bar 里）
            'x-align': 'left', // 左边、右边
          },
        },
        {
          name: 'action-2',
          title: '{{t("Action 2")}}',
          Component: 'ActionInitializer',
          schema: {
            title: 'Action 2',
            'x-component': 'Action',
            'x-action': 'action2',
            'x-align': 'right',
          },
        },
      ],
    },
  ],
});

const schema: ISchema = {
  type: 'object',
  properties: {
    actions: {
      type: 'void',
      'x-component': 'ActionBar',
      'x-initializer': 'AddActionButton',
      'x-uid': uid(),
      properties: {
        a1: {
          title: 'Action 1',
          'x-component': 'Action',
          'x-action': 'action1',
          'x-align': 'left',
        },
      },
    },
  },
};

const Root = () => {
  return (
    <SchemaComponentProvider designable components={{ ActionInitializer, ActionBar, Action }}>
      <SchemaComponent schema={schema} />
    </SchemaComponentProvider>
  );
};

class MyPlugin extends Plugin {
  async load() {
    // 注册 schema initializer
    this.app.schemaInitializerManager.add(addActionButton);

    // 注册路由
    this.app.router.add('root', {
      path: '/',
      Component: Root,
    });
  }
}

const app = new Application({
  router: {
    type: 'memory',
    initialEntries: ['/'],
  },
  plugins: [MyPlugin],
});

export default app.getRootComponent();
