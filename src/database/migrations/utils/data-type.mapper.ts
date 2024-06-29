import { DatabaseType } from "typeorm";

const DATA_TYPES: Record<'timestamp' | 'boolean', Record<'cockroachdb' | 'sqlite', string>> = {
  timestamp: {
    cockroachdb: 'TIMESTAMPTZ',
    sqlite: 'datetime',
  },
  boolean: {
    cockroachdb: 'BOOL',
    sqlite: 'boolean',
  }
};

export const getDataType = (driver: DatabaseType, dataType: keyof typeof DATA_TYPES) => {
  if (driver !== 'cockroachdb' && driver !== 'sqlite') {
    throw new Error('unsupported database type');
  }

  return DATA_TYPES[dataType][driver];
}
