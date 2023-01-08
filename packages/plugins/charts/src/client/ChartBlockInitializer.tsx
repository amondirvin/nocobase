import { FormOutlined } from '@ant-design/icons';
import { FormDialog, FormLayout } from '@formily/antd';
import { Field } from '@formily/core';
import { observer, RecursionField, Schema, SchemaOptionsContext, useField, useForm } from '@formily/react';
import {
  DataBlockInitializer,
  SchemaComponent,
  SchemaComponentOptions,
  useAPIClient,
  useCollectionManager
} from '@nocobase/client';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartConfigurationOptions } from './ChartSchemaTemplates';
import { templates } from './templates';

export const Options = observer((props) => {
  const form = useForm();
  const field = useField<Field>();
  const [s, setSchema] = useState(new Schema({}));
  useEffect(() => {
    form.clearFormGraph('options.*');
    if (form.values.chartType) {
      const template = templates.get(form.values.chartType);
      setSchema(new Schema(template.configurableProperties || {}));
    }
  }, [form.values.chartType]);
  return <RecursionField name={form.values.chartType || 'default'} schema={s} />;
});

export const ChartBlockInitializer = (props) => {
  const { insert } = props;
  const { t } = useTranslation();
  const { getCollectionFields, getCollection } = useCollectionManager();
  const options = useContext(SchemaOptionsContext);
  const api = useAPIClient();
  return (
    <DataBlockInitializer
      {...props}
      componentType={'Kanban'}
      icon={<FormOutlined />}
      onCreateBlockSchema={async ({ item }) => {
        const collectionFields = getCollectionFields(item.name);
        let values = await FormDialog(t('Create chart block'), () => {
          return (
            <SchemaComponentOptions
              scope={options.scope}
              components={{ ...options.components, ChartConfigurationOptions }}
            >
              <FormLayout layout={'vertical'}>
                <SchemaComponent
                  scope={{ computedFields: [] }}
                  components={{ Options }}
                  schema={{
                    properties: {
                      chartType: {
                        title: t('Chart type'),
                        required: true,
                        'x-component': 'Select',
                        'x-decorator': 'FormItem',
                        enum: [...templates.values()].map((template) => {
                          return {
                            label: template.type,
                            value: template.type,
                          };
                        }),
                      },
                      options: {
                        type: 'void',
                        'x-component': 'Options',
                      },
                    },
                  }}
                />
              </FormLayout>
            </SchemaComponentOptions>
          );
        }).open({
          initialValues: {},
        });
        if (values) {
          values = {
            collectionName: item.name,
            ...values,
          };
          console.log(values);
          insert({
            type: 'void',
            'x-designer': 'G2Plot.Designer',
            'x-decorator': 'CardItem',
            'x-component': 'ChartBlockEngine',
            'x-component-props': {
              formData: values,
            },
          });
        }
      }}
    />
  );
};
