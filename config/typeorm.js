import { DataSource } from "typeorm"

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// export default new DataSource({
//   type: "sqlite",
//   database: './example-data/database.sqlite3',
//   entities: [`${__dirname}/../src/database/entities/**/*.entity.ts`],
//   migrations: [`${__dirname}/../src/database/migrations/**/*.migration.ts`],
// });

export default new DataSource({
  type: "cockroachdb",
  database: 'dev_image-server',
  host: '10.0.4.13',
  port: 26257,
  username: 'dev_image-server',
  password: '123456',
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [`${__dirname}/../src/database/entities/**/*.entity.ts`],
  migrations: [`${__dirname}/../src/database/migrations/**/*.migration.ts`],
});
