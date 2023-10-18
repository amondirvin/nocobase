import { enableToConfig, expect, test } from '@nocobase/test/client';

test.describe('page header', () => {
  test('disabled & enabled page header', async ({ page, mockPage }) => {
    await mockPage({ name: 'page header' }).goto();
    //默认开启
    await expect(page.getByTitle('page header')).toBeVisible();
    await page
      .locator('div')
      .filter({ hasText: /^page header$/ })
      .nth(3)
      .click();
    await page.getByTestId('page-designer-button').locator('path').hover();
    await expect(page.getByRole('menuitem', { name: 'Enable page header' }).getByRole('switch')).toBeChecked();
    //关闭
    await page.getByRole('menuitem', { name: 'Enable page header' }).getByRole('switch').click();
    await expect(page.getByTitle('page header')).not.toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^page header$/ })
        .nth(3),
    ).not.toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Enable page header' }).getByRole('switch')).not.toBeChecked();
    //开启
    await page.getByRole('main').locator('span').nth(1).click();
    await page.getByTestId('page-designer-button').locator('path').hover();
    await page.getByRole('menuitem', { name: 'Enable page header' }).getByRole('switch').click();
    await expect(page.getByTitle('page header')).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^page header$/ })
        .nth(3),
    ).toBeVisible();
  });
});

test.describe('page title', () => {
  test('disable & not disable page title', async ({ page, mockPage }) => {
    await mockPage({ name: 'page title' }).goto();
    //默认显示
    await expect(page.getByTitle('page title')).toBeVisible();
    await page
      .locator('div')
      .filter({ hasText: /^page title$/ })
      .nth(3)
      .click();
    await page.getByTestId('page-designer-button').locator('path').hover();
    await expect(page.getByRole('menuitem', { name: 'Display page title' }).getByRole('switch')).toBeChecked();
    //不显示
    await page.getByRole('menuitem', { name: 'Display page title' }).getByRole('switch').click();
    await expect(page.locator('.ant-page-header')).toBeVisible();
    await expect(page.getByTitle('page title')).not.toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^page title$/ })
        .nth(3),
    ).not.toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Display page title' }).getByRole('switch')).not.toBeChecked();
    //开启
    await page.locator('.ant-page-header').click();
    await page.getByTestId('page-designer-button').locator('path').hover();
    await page.getByRole('menuitem', { name: 'Display page title' }).getByRole('switch').click();
    await expect(page.getByTitle('page title')).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^page title$/ })
        .nth(3),
    ).toBeVisible();
  });
  test('edit page title', async ({ page, mockPage }) => {
    await mockPage({ name: 'page title1' }).goto();

    await expect(page.getByTitle('page title1')).toBeVisible();
    await page
      .locator('div')
      .filter({ hasText: /^page title1$/ })
      .nth(3)
      .click();
    await page.getByTestId('page-designer-button').locator('path').hover();
    await page.getByText('Edit page title').click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('page title2');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByText('page title2').click();
    await expect(page.getByText('page title2')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^page title1$/ })).toBeVisible();
  });
});

test.describe('page tabs', () => {
  test('enable & disabled page tab', async ({ page, mockPage }) => {
    await mockPage({ name: 'page tab' }).goto();
    await enableToConfig(page);
    await page
      .locator('div')
      .filter({ hasText: /^page tab$/ })
      .nth(3)
      .click();
    await page.getByTestId('page-designer-button').locator('path').hover();
    //默认不启用
    await expect(page.getByRole('menuitem', { name: 'Enable page tabs' }).getByRole('switch')).not.toBeChecked();
    //启用标签
    await page.getByText('Enable page tabs').click();
    await expect(page.getByRole('tab').locator('div').filter({ hasText: 'Unnamed' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'plus Add tab' })).toBeVisible();
    await page.getByRole('tab').locator('div').filter({ hasText: 'Unnamed' }).click();
    await expect(page.getByTestId('add-block-button-in-page')).toBeVisible();

    //添加新的tab
    await page.getByRole('button', { name: 'plus Add tab' }).click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('page tab 1');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByText('page tab 1').click();
    await page.getByRole('button', { name: 'plus Add tab' }).click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('page tab 2');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByText('page tab 2').click();

    await page.waitForTimeout(1000); // 等待1秒钟
    const tabMenuItem = await page.getByRole('tab').locator('div > span').filter({ hasText: 'page tab 2' });
    const tabMenuItemActivedColor = await tabMenuItem.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.color;
    });
    await expect(page.getByText('page tab 1')).toBeVisible();
    await expect(page.getByText('page tab 2')).toBeVisible();
    await expect(page.getByTestId('add-block-button-in-page')).toBeVisible();
    await expect(tabMenuItemActivedColor).toBe('rgb(22, 119, 255)');

    //修改tab名称
    await page.getByText('Unnamed').click();
    await page.getByText('Unnamed').hover();
    await page.getByRole('button', { name: 'menu', exact: true }).hover();
    await page.getByText('Edit', { exact: true }).click();
    await page.getByRole('textbox').fill('page tab');
    await page.getByRole('button', { name: 'OK' }).click();

    const tabMenuItem1 = await page.getByRole('tab').getByText('page tab', { exact: true });
    const tabMenuItemActivedColor1 = await tabMenuItem1.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.color;
    });
    await expect(tabMenuItem1).toBeVisible();
    await expect(page.getByTestId('add-block-button-in-page')).toBeVisible();
    await expect(tabMenuItemActivedColor1).toBe('rgb(22, 119, 255)');

    //删除 tab
    await page.getByRole('tab').getByText('page tab', { exact: true }).click();
    await page.getByRole('tab').getByText('page tab', { exact: true }).hover();
    await page.getByRole('button', { name: 'menu', exact: true }).hover();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByRole('tab').getByText('page tab', { exact: true })).not.toBeVisible();
    await page.getByRole('tab').getByText('page tab 1').click();

    //禁用标签
  });
  test('move page tab', async ({ page, mockPage }) => {
    await mockPage({
      pageSchema: {
        'x-uid': 'h8q2mcgo3cq',
        _isJSONSchemaObject: true,
        version: '2.0',
        type: 'void',
        'x-component': 'Page',
        'x-component-props': {
          enablePageTabs: true,
        },
        properties: {
          bi8ep3svjee: {
            'x-uid': '9kr7xm9x4ln',
            _isJSONSchemaObject: true,
            version: '2.0',
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'BlockInitializers',
            title: 'tab 1',
            'x-async': false,
            'x-index': 1,
          },
          rw91udnzpr3: {
            _isJSONSchemaObject: true,
            version: '2.0',
            type: 'void',
            title: 'tab 2',
            'x-component': 'Grid',
            'x-initializer': 'BlockInitializers',
            'x-uid': 'o5vp90rqsjx',
            'x-async': false,
            'x-index': 2,
          },
        },
        'x-async': true,
        'x-index': 1,
      },
    }).goto();

    const sourceElement = await page.locator('span:has-text("tab 2")');
    await sourceElement.hover();
    const source = await page.getByRole('button', { name: 'drag' });
    await source.hover();
    const targetElement = await page.locator('span:has-text("tab 1")');
    const sourceBoundingBox = await sourceElement.boundingBox();
    const targetBoundingBox = await targetElement.boundingBox();
    //拖拽前 1-2
    expect(targetBoundingBox.x).toBeLessThan(sourceBoundingBox.x);
    await source.dragTo(targetElement);
    await sourceElement.dragTo(targetElement);
    await page.waitForTimeout(1000); // 等待1秒钟
    const tab2 = await page.locator('span:has-text("tab 2")').boundingBox();
    const tab1 = await page.locator('span:has-text("tab 1")').boundingBox();
    //拖拽后 2-1
    await expect(tab2.x).toBeLessThan(tab1.x);
  });
});