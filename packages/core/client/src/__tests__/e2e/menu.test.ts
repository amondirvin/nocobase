import { enableToConfig, expect, test } from '@nocobase/test/client';

test.describe('menu', () => {
  test('create new page, then delete', async ({ page }) => {
    await page.goto('/');
    await enableToConfig(page);

    await page.getByTestId('add-menu-item-button-in-header').hover();
    await page.getByRole('menuitem', { name: 'Page' }).click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('new page');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByText('new page').click();

    await expect(page.getByTestId('add-block-button-in-page')).toBeVisible();

    // 删除页面，避免影响其他测试
    await page.getByRole('menu').getByText('new page').hover();
    await page.getByTestId('designer-schema-settings').hover();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
  });
  test('edit menu title', async ({ page, mockPage }) => {
    await mockPage({
      name: 'page title',
    }).goto();
    await page.getByRole('menu').getByText('page title').hover();
    await page.getByTestId('designer-schema-settings').hover();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('page title1');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('menu').getByText('page title1').click();
    await mockPage().goto();
    await page.getByText('page title1').click();
    await expect(page.getByTitle('page title1')).toBeVisible();
  });
  test('move menu ', async ({ page, mockPage }) => {
    await mockPage({
      name: 'page1',
    }).goto();
    await mockPage({ name: 'page2' }).goto();
    await enableToConfig(page);

    await page.getByRole('menu').getByText('page1').click();
    await page.getByRole('menu').getByText('page1').hover();
    await page.getByTestId('designer-schema-settings').hover();
    await page.getByRole('menuitem', { name: 'Move to' }).click();
    await page.getByLabel('Search').click();
    await page.getByTitle('page2').getByText('page2').click();
    await page.getByRole('button', { name: 'OK' }).click();
    const page1 = await page.getByRole('menu').getByText('page1').boundingBox();
    const page2 = await page.getByRole('menu').getByText('page2').boundingBox();
    expect(page2.x).toBeLessThan(page1.x);
  });

  test('insert page before', async ({ page, mockPage }) => {
    await mockPage({
      name: 'page3',
    }).goto();
    await enableToConfig(page);
    await page.getByRole('menu').getByText('page3').click();
    await page.getByRole('menu').getByText('page3').hover();
    await page.getByTestId('designer-schema-settings').hover();
    await page.getByRole('menuitem', { name: 'Insert before' }).click();
    await page.getByRole('menuitem', { name: 'Page' }).locator('span').click();
    await page.locator('.ant-input-affix-wrapper').click();
    await page.getByRole('textbox').fill('page4');
    await page.getByRole('button', { name: 'OK' }).click();

    const page3 = await page.getByRole('menu').getByText('page3').boundingBox();
    const page4 = await page.getByRole('menu').getByText('page4').boundingBox();
    expect(page4.x).toBeLessThan(page3.x);
  });
});
