import { CollectionTemplateBase, getConfigurableProperties, Plugin } from '@nocobase/client';

class MyCollectionTemplate extends CollectionTemplateBase {
  name = 'myCollection';
  title = '{{t("Custom template")}}';
  order = 6;
  color = 'blue';
  default = {
    fields: [
      {
        name: 'uuid',
        type: 'string',
        primaryKey: true,
        allowNull: false,
        uiSchema: { type: 'number', title: '{{t("UUID")}}', 'x-component': 'Input', 'x-read-pretty': true },
        interface: 'input',
      },
    ],
  };
  configurableProperties = getConfigurableProperties('title', 'name', 'inherits', 'createdAt', 'updatedAt');
  availableFieldInterfaces = {
    include: [
      'input',
      {
        interface: 'o2m',
        targetScope: {
          template: ['calendar'],
        },
      },
      {
        interface: 'm2m',
        targetScope: {
          template: ['calendar', 'myCollection'],
        },
      },
      {
        interface: 'linkTo',
        targetScope: {
          template: ['myCollection'],
        },
      },
    ],
    // exclude: ['input', 'linkTo'],
  };
}

class CustomCollectionPlugin extends Plugin {
  async load() {
    this.app.collectionManager.addCollectionTemplates([MyCollectionTemplate]);
  }
}

export default CustomCollectionPlugin;
