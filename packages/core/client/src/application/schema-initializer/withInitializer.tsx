/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ISchema, observer } from '@formily/react';
import { ConfigProvider, Popover, theme } from 'antd';
import React, { ComponentType, useCallback, useMemo, useState } from 'react';

import { css } from '@emotion/css';
import { useNiceDropdownMaxHeight } from '../../common/useNiceDropdownHeight';
import { useFlag } from '../../flag-provider';
import { ErrorFallback, useDesignable } from '../../schema-component';
import { useSchemaInitializerStyles } from './components/style';
import { SchemaInitializerContext } from './context';
import { SchemaInitializerOptions } from './types';
import { ErrorBoundary } from 'react-error-boundary';

const defaultWrap = (s: ISchema) => s;

export function withInitializer<T>(C: ComponentType<T>) {
  const WithInitializer = observer(
    (props: SchemaInitializerOptions<T>) => {
      const { designable, insertAdjacent } = useDesignable();
      const { isInSubTable } = useFlag() || {};
      const {
        insert,
        useInsert,
        wrap = defaultWrap,
        insertPosition = 'beforeEnd',
        onSuccess,
        designable: propsDesignable,
        popoverProps,
        children,
        popover = true,
        style,
        componentProps,
      } = props;

      // 插入 schema 的能力
      const insertCallback = useInsert ? useInsert() : insert;
      const insertSchema = useCallback(
        (schema) => {
          if (insertCallback) {
            insertCallback(wrap(schema, { isInSubTable }));
          } else {
            insertAdjacent(insertPosition, wrap(schema, { isInSubTable }), { onSuccess });
          }
        },
        [insertCallback, wrap, insertAdjacent, insertPosition, onSuccess],
      );

      const { wrapSSR, hashId, componentCls } = useSchemaInitializerStyles();
      const [visible, setVisible] = useState(false);
      const { token } = theme.useToken();
      const dropdownMaxHeight = useNiceDropdownMaxHeight([visible]);

      const cProps = useMemo(
        () => ({
          options: props,
          style,
          ...componentProps,
        }),
        [componentProps, props, style],
      );

      const overlayClassName = useMemo(() => {
        return css`
          .ant-popover-inner {
            padding: ${`${token.paddingXXS}px 0`};
            .ant-menu-submenu-title {
              margin-block: 0;
            }
            .ant-popover-inner-content {
              padding: 0;
            }
          }
        `;
      }, [token.paddingXXS]);

      // designable 为 false 时，不渲染
      if (!designable && propsDesignable !== true) {
        return null;
      }

      return (
        <ErrorBoundary FallbackComponent={ErrorFallback.Modal} onError={(err) => console.error(err)}>
          <SchemaInitializerContext.Provider
            value={{
              visible,
              setVisible,
              insert: insertSchema,
              options: props,
            }}
          >
            {popover === false ? (
              React.createElement(C, cProps)
            ) : (
              <Popover
                placement={'bottomLeft'}
                {...popoverProps}
                arrow={false}
                overlayClassName={overlayClassName}
                open={visible}
                onOpenChange={setVisible}
                content={wrapSSR(
                  <div
                    className={`${componentCls} ${hashId}`}
                    style={{
                      maxHeight: dropdownMaxHeight,
                      overflowY: 'auto',
                    }}
                  >
                    <ConfigProvider
                      theme={{
                        components: {
                          Menu: {
                            itemHeight: token.marginXL,
                            borderRadius: token.borderRadiusSM,
                            itemBorderRadius: token.borderRadiusSM,
                            subMenuItemBorderRadius: token.borderRadiusSM,
                          },
                        },
                      }}
                    >
                      {children}
                    </ConfigProvider>
                  </div>,
                )}
              >
                {React.createElement(C, cProps)}
              </Popover>
            )}
          </SchemaInitializerContext.Provider>
        </ErrorBoundary>
      );
    },
    { displayName: `WithInitializer(${C.displayName || C.name})` },
  );
  return WithInitializer;
}
