import AdmZip from 'adm-zip';
import Database from 'better-sqlite3';
import { HTTPException } from 'hono/http-exception';
import { mapToResponseObject, parseFakturPrefix, query } from './util.js';
import type { Row } from './type.js';
import { Exception } from './exception.js';

interface DBParams {
  buffer: Buffer;
  userID: string;
  storeID: string;
  date: string;
}

export const preparingFileDB = async (file: File | string) => {
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

  return {
    storeID,
    fakturPrefix: parseFakturPrefix(dateTX),
    userID,
    dataBuffer: dbFile.getData(),
  };
};

export const processDB = (
  buffer: Buffer,
  userID: string,
  fakturPrefix: string,
) => {
  // validasi format kodetoko dan userID disini
  const db = new Database(buffer);

  // cek kode toko ke db disini

  let rows: Row[];
  try {
    rows = db.prepare(query).all(userID, fakturPrefix) as Row[];
  } catch (error) {
    throw Exception.ServerError('failed get transaction data');
  }

  return mapToResponseObject(rows);
};
