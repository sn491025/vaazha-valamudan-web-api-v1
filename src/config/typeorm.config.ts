import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });

export const AppDataSource = new DataSource({
  /*type: 'postgres',
  host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '16174', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'kRXGPIfRyJvtJVdBEsIEaiMbbEmWJsbw',
  database: process.env.DB_NAME || 'railway',
  migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  // Auto-discover all entity files in the compiled dist (and ts in dev)
  entities: [path.join(__dirname, '..', '', '*.entity.{js,ts}')],
  synchronize: true,
  logging: true,
  ssl: false,
  migrationsRun: false,
  dropSchema: false
  postgresql://dina:eaMlT6SYgNJowjv4XYw7A2GarihOWYzy@dpg-d4gjoi95pdvs738l3d2g-a.singapore-postgres.render.com/realestatedb_fcd3
  postgresql://dina:eaMlT6SYgNJowjv4XYw7A2GarihOWYzy@dpg-d4gjoi95pdvs738l3d2g-a/realestatedb_fcd3
*/

// postgresql://postgres:rlzBWEYcMJBBxsPMtZwAcSoWOwKuyOCJ@nozomi.proxy.rlwy.net:59334/railway
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'nozomi.proxy.rlwy.net',
  port: parseInt(process.env.POSTGRES_PORT || '59334', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'rlzBWEYcMJBBxsPMtZwAcSoWOwKuyOCJ',
  database: process.env.POSTGRES_DB || 'railway',
  migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  // Auto-discover all entity files in the compiled dist (and ts in dev)
  entities: [path.join(__dirname, '..', '', '*.entity.{js,ts}')],
  synchronize: true,
  logging: true,
  migrationsRun: false,
  dropSchema: false,
  ssl: {
    rejectUnauthorized: false,
  },
});