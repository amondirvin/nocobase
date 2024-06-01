/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, Next } from '@nocobase/actions';
import { Repository } from '@nocobase/database';
import XLSX from 'xlsx';
import { XlsxImporter } from '../services/xlsx-importer';
import { Mutex } from 'async-mutex';
import { DataSource } from '@nocobase/data-source-manager';

const mutex = new Mutex();

const IMPORT_LIMIT_COUNT = 200;

async function importXlsxAction(ctx: Context, next: Next) {
  let columns = (ctx.request.body as any).columns as any[];
  if (typeof columns === 'string') {
    columns = JSON.parse(columns);
  }

  const workbook = XLSX.read(ctx.file.buffer, {
    type: 'buffer',
    sheetRows: IMPORT_LIMIT_COUNT,
  });

  const repository = ctx.getCurrentRepository() as Repository;
  const dataSource = ctx.dataSource as DataSource;

  const collection = repository.collection;

  const importer = new XlsxImporter({
    collectionManager: dataSource.collectionManager,
    collection,
    columns,
    workbook,
  });

  const importedCount = await importer.run();

  ctx.body = {
    successCount: importedCount,
  };
}

export async function importXlsx(ctx: Context, next: Next) {
  if (mutex.isLocked()) {
    throw new Error(`another import action is running, please try again later.`);
  }

  const release = await mutex.acquire();

  try {
    await importXlsxAction(ctx, next);
  } finally {
    release();
  }

  await next();
}
