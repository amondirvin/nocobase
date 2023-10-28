import React, { useContext } from 'react';
import {
  AntdSchemaComponentProvider,
  Application,
  CardItem,
  CollectionManagerContext,
  CollectionManagerProvider,
  CollectionProvider,
  FormItem,
  Grid,
  Input,
  InputNumber,
  Markdown,
  Plugin,
  SchemaComponent,
  SchemaComponentOptions,
  SchemaInitializerItem,
  SchemaInitializer,
  useCollectionManager,
  useSchemaInitializer,
  useSchemaInitializerItem,
} from '@nocobase/client';
import { FormDrawer, FormLayout } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { ISchema } from '@formily/json-schema';
import { FormContext, SchemaOptionsContext } from '@formily/react';
import { uid } from '@formily/shared';
import { cloneDeep } from 'lodash';

const collection: any = {
  name: 'posts',
  fields: [],
};

const schema: ISchema = {
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': Grid,
      'x-read-pretty': true,
      'x-initializer': 'AddFieldButton',
      'x-uid': uid(),
      properties: {},
    },
  },
};

const gridRowColWrap = (schema: ISchema) => {
  return {
    type: 'void',
    'x-component': Grid.Row,
    properties: {
      [uid()]: {
        type: 'void',
        'x-component': Grid.Col,
        properties: {
          [schema.name || uid()]: schema,
        },
      },
    },
  };
};

const form = createForm({
  initialValues: {},
  // readPretty: true,
});

const FormItemInitializer = () => {
  const itemConfig = useSchemaInitializerItem();
  const { getInterface } = useCollectionManager();
  const schemaOptions = useContext(SchemaOptionsContext);
  const cm = useContext(CollectionManagerContext);
  const { insert } = useSchemaInitializer();
  return (
    <SchemaInitializerItem
      title={'add'}
      onClick={async () => {
        const interfaceOptions = getInterface(itemConfig.fieldInterface);
        if (!interfaceOptions) {
          return;
        }
        const name = `f_${uid()}`;
        const options = cloneDeep(interfaceOptions.default);
        options.name = name;
        options.uiSchema.title = name;
        collection.fields.push(options);
        form.setValuesIn(name, uid());

        await FormDrawer('Add field', () => {
          return (
            <CollectionManagerContext.Provider value={cm}>
              <AntdSchemaComponentProvider>
                <SchemaComponentOptions scope={schemaOptions.scope} components={schemaOptions.components}>
                  <FormLayout layout={'vertical'}>
                    <SchemaComponent
                      schema={{
                        properties: interfaceOptions.properties,
                      }}
                    />
                  </FormLayout>
                </SchemaComponentOptions>
              </AntdSchemaComponentProvider>
            </CollectionManagerContext.Provider>
          );
        }).open({
          initialValues: {},
        });

        insert({
          name,
          type: 'string',
          'x-component': 'CollectionField',
          'x-collection-field': `posts.${name}`,
          'x-component-props': {},
          'x-decorator': 'FormItem',
          'x-designer': 'FormItem.Designer',
        });
      }}
    />
  );
};

const addFieldButton = new SchemaInitializer({
  name: 'AddFieldButton',
  // 正常情况下这个值为 false，通过点击页面左上角的设计按钮切换，这里为了显示设置为 true
  designable: true,
  //  按钮标题标题
  title: 'Add Field',
  // 调用 initializer.render() 时会渲染 items 列表
  wrap: gridRowColWrap,
  items: [
    {
      name: 'media',
      type: 'itemGroup',
      title: 'Field interfaces',
      children: [
        {
          name: 'single-text',
          title: 'Single text',
          fieldInterface: 'input',
          Component: FormItemInitializer,
        },
      ],
    },
  ],
});

const Root = () => {
  return (
    <CollectionManagerProvider>
      <CollectionProvider collection={collection}>
        <FormContext.Provider value={form}>
          <FormLayout layout={'vertical'}>
            <SchemaComponent schema={schema} />
          </FormLayout>
        </FormContext.Provider>
      </CollectionProvider>
    </CollectionManagerProvider>
  );
};

class MyPlugin extends Plugin {
  async load() {
    // 注册组件
    this.app.addComponents({
      Grid,
      CardItem,
      Markdown,
      InputNumber,
      FormItem,
      Input,
    });
    // 注册 schema initializer
    this.app.schemaInitializerManager.add(addFieldButton);
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
