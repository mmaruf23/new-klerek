import AdmZip from 'adm-zip';
import BetterSqlite3 from 'better-sqlite3';
import {
  isValidUserID,
  mapToResponseObject,
  parseFakturPrefix,
  query,
} from './helper.js';
import type { Row } from './type.js';
import { Exception } from '../../error.js';
import { isValidStoreID } from '../store/helper.js';

interface DBParams {
  buffer: Buffer;
  userID: string;
  storeID: string;
  dateFx: string;
}

export const prepareDbBuffer = async (
  file: File | string,
): Promise<DBParams> => {
  if (typeof file == 'string')
    throw Exception.Validation('invalid request format');

  if (!file.name.endsWith('.zip'))
    throw Exception.Validation('invalid request content');

  const buffer = Buffer.from(await file.arrayBuffer());
  const zip = new AdmZip(buffer);

  const [dbFile] = zip.getEntries();
  if (!dbFile.entryName.endsWith('.db'))
    throw Exception.BadRequest('invalid file content');

  const [storeID, dateTX, userID] = dbFile.name.split('_');

  if (!isValidStoreID(storeID) || !isValidUserID(userID))
    throw Exception.BadRequest('invalid file content format');

  return {
    storeID,
    dateFx: parseFakturPrefix(dateTX),
    userID,
    buffer: dbFile.getData(),
  };
};

export const initAndValidateDB = (buffer: Buffer): BetterSqlite3.Database => {
  let db: BetterSqlite3.Database;
  try {
    db = new BetterSqlite3(buffer);
    const { table_exists } = db
      .prepare<
        [],
        { table_exists: boolean }
      >("SELECT 1 as table_exists FROM sqlite_master WHERE name = 'tx_tsale' LIMIT 1")
      .get()!;

    if (!table_exists) {
      db.close();
      throw Exception.BadRequest('invalid file content format');
    }
  } catch (error) {
    console.error(error);
    throw Exception.ServerError('error while reading file content');
  }

  return db;
};

export const processDB = (
  db: BetterSqlite3.Database,
  userID: string,
  fakturPrefix: string,
) => {
  let rows: Row[];
  try {
    rows = db.prepare(query).all(userID, fakturPrefix) as Row[];
  } catch (error) {
    throw Exception.ServerError('failed get transaction data');
  }

  return mapToResponseObject(rows);
};
