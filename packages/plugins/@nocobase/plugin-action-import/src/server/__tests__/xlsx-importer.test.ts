/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { createMockServer, MockServer } from '@nocobase/test';
import { TemplateCreator } from '../services/template-creator';
import { XlsxImporter } from '../services/xlsx-importer';
import XLSX from 'xlsx';

describe('xlsx importer', () => {
  let app: MockServer;
  beforeEach(async () => {
    app = await createMockServer({});
  });

  afterEach(async () => {
    await app.destroy();
  });

  it('should validate workbook with error', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.sheet_new();

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['column1', 'column2'],
        ['row21', 'row22'],
      ],
      {
        origin: 'A1',
      },
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook,
    });

    let error;
    try {
      importer.getData();
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should validate workbook true', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    let error;
    try {
      importer.getData();
    } catch (e) {
      error = e;
    }

    expect(error).toBeFalsy();
  });

  it('should import with associations', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    const Tag = app.db.collection({
      name: 'tags',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
      ],
    });

    const Comments = app.db.collection({
      name: 'comments',
      fields: [
        {
          type: 'string',
          name: 'content',
        },
      ],
    });

    const Post = app.db.collection({
      name: 'posts',
      fields: [
        {
          type: 'string',
          name: 'title',
        },
        {
          type: 'string',
          name: 'content',
        },
        {
          type: 'belongsTo',
          name: 'user',
          interface: 'm2o',
        },
        {
          type: 'belongsToMany',
          name: 'tags',
          through: 'postsTags',
          interface: 'm2m',
        },
        {
          type: 'hasMany',
          name: 'comments',
          interface: 'o2m',
        },
      ],
    });

    await app.db.sync();

    await User.repository.create({
      values: {
        name: 'User1',
        email: 'u1@test.com',
      },
    });

    await Tag.repository.create({
      values: [
        {
          name: 'Tag1',
        },
        {
          name: 'Tag2',
        },
        {
          name: 'Tag3',
        },
      ],
    });

    await Comments.repository.create({
      values: [
        {
          content: 'Comment1',
        },
        {
          content: 'Comment2',
        },
        {
          content: 'Comment3',
        },
      ],
    });

    const importColumns = [
      {
        dataIndex: ['title'],
        defaultTitle: '标题',
      },
      {
        dataIndex: ['content'],
        defaultTitle: '内容',
      },
      {
        dataIndex: ['user', 'name'],
        defaultTitle: '作者',
      },
      {
        dataIndex: ['tags', 'name'],
        defaultTitle: '标签',
      },
      {
        dataIndex: ['comments', 'content'],
        defaultTitle: '评论',
      },
    ];

    const templateCreator = new TemplateCreator({
      collection: Post,
      columns: importColumns,
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['Post1', 'Content1', 'User1', 'Tag1,Tag2', 'Comment1,Comment2'],
        ['Post2', 'Content2', 'User1', 'Tag2,Tag3', 'Comment3'],
        ['Post3', 'Content3', 'UserNotExist', 'Tag3,TagNotExist', ''],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: Post,
      columns: importColumns,
      workbook: template,
    });

    await importer.run();

    expect(await Post.repository.count()).toBe(3);
  });

  it('should import data with xlsx', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    await app.db.sync();

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['User1', 'test@test.com'],
        ['User2', 'test2@test.com'],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    await importer.run();

    expect(await User.repository.count()).toBe(2);
  });

  it('should throw error when import failed', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
          unique: true,
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    await app.db.sync();

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['User1', 'test@test.com'],
        ['User1', 'test2@test.com'],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    let error;
    try {
      await importer.run();
    } catch (e) {
      error = e;
    }

    expect(await User.repository.count()).toBe(0);
    expect(error).toBeTruthy();
  });
});