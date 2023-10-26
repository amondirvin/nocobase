import React from 'react';

import {
  CollectionProvider,
  SchemaInitializerItem,
  SchemaInitializerItemOptions,
  useCollectionManager,
  useRecordCollectionDataSourceItems,
  useSchemaInitializer,
  useSchemaTemplateManager,
} from '@nocobase/client';
import { traverseSchema } from '../nodes/manual/utils';

function InnerCollectionBlockInitializer({ collection, dataSource, ...props }) {
  const { insert } = useSchemaInitializer();
  const { getTemplateSchemaByMode } = useSchemaTemplateManager();
  const { getCollection } = useCollectionManager();
  const items = useRecordCollectionDataSourceItems('FormItem') as SchemaInitializerItemOptions[];
  const resolvedCollection = getCollection(collection);

  async function onConfirm({ item }) {
    const template = item.template ? await getTemplateSchemaByMode(item) : null;
    const result = {
      type: 'void',
      name: resolvedCollection.name,
      title: resolvedCollection.title,
      'x-decorator': 'DetailsBlockProvider',
      'x-decorator-props': {
        collection,
        dataSource,
      },
      'x-component': 'CardItem',
      'x-component-props': {
        title: props.title,
      },
      'x-designer': 'SimpleDesigner',
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormV2',
          'x-component-props': {
            useProps: '{{useDetailsBlockProps}}',
          },
          'x-read-pretty': true,
          properties: {
            grid: template || {
              type: 'void',
              'x-component': 'Grid',
              'x-initializer': 'ReadPrettyFormItemInitializers',
              properties: {},
            },
          },
        },
      },
    };
    traverseSchema(result, (node) => {
      if (node['x-uid']) {
        delete node['x-uid'];
      }
    });
    insert(result);
  }

  return <SchemaInitializerItem {...props} onClick={onConfirm} items={items} />;
}

export function CollectionBlockInitializer(props) {
  return (
    <CollectionProvider collection={props.collection}>
      <InnerCollectionBlockInitializer {...props} />
    </CollectionProvider>
  );
}
