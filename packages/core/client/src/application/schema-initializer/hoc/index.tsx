import { ISchema, observer } from '@formily/react';
import { Popover, theme } from 'antd';
import React, { ComponentType, useCallback, useMemo, useState } from 'react';

import { css } from '@emotion/css';
import { useDesignable } from '../../../schema-component';
import { useSchemaInitializerStyles } from '../components/style';
import { SchemaInitializerContext } from '../context';
import { SchemaInitializerOptions } from '../types';

const defaultWrap = (s: ISchema) => s;

export function withInitializer<T>(C: ComponentType<T>) {
  const WithInitializer = observer((props: SchemaInitializerOptions<T>) => {
    const { designable, insertAdjacent } = useDesignable();
    const {
      insert,
      useInsert,
      wrap = defaultWrap,
      insertPosition = 'beforeEnd',
      onSuccess,
      designable: propsDesignable,
      popoverProps,
      children,
      noPopover,
      style,
      componentProps,
    } = props;

    // 插入 schema 的能力
    const insertCallback = useInsert ? useInsert() : insert;
    const insertSchema = useCallback(
      (schema) => {
        if (insertCallback) {
          insertCallback(wrap(schema));
        } else {
          insertAdjacent(insertPosition, wrap(schema), { onSuccess });
        }
      },
      [insertCallback, wrap, insertAdjacent, insertPosition, onSuccess],
    );

    const { wrapSSR, hashId, componentCls } = useSchemaInitializerStyles();
    const [visible, setVisible] = useState(false);
    const { token } = theme.useToken();

    const cProps = useMemo(
      () => ({
        options: props,
        style,
        ...componentProps,
      }),
      [componentProps, props, style],
    );

    // designable 为 false 时，不渲染
    if (!designable && propsDesignable !== true) {
      return null;
    }

    return (
      <SchemaInitializerContext.Provider
        value={{
          visible,
          setVisible,
          insert: insertSchema,
          options: props,
        }}
      >
        {noPopover ? (
          React.createElement(C, cProps)
        ) : (
          <Popover
            placement={'bottomLeft'}
            {...popoverProps}
            arrow={false}
            className={'nb-className'}
            openClassName={'nb-openClassName'}
            overlayClassName={css`
              .ant-popover-inner {
                padding: ${`${token.paddingXXS}px 0`};
                .ant-menu-submenu-title {
                  margin-block: 0;
                }
              }
            `}
            open={visible}
            onOpenChange={setVisible}
            content={wrapSSR(
              <div
                className={`${componentCls} ${hashId}`}
                style={{
                  maxHeight: 'calc(50vh - 50px)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {children}
              </div>,
            )}
          >
            {React.createElement(C, cProps)}
          </Popover>
        )}
      </SchemaInitializerContext.Provider>
    );
  });

  WithInitializer.displayName = `WithInitializer(${C.displayName || C.name})`;
  return WithInitializer;
}