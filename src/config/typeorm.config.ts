import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'qa'
  ? '.env.qa'
  : process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

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

  type: 'postgres',
  host: process.env.DB_HOST || 'dpg-d4gjoi95pdvs738l3d2g-a.singapore-postgres.render.com',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'dina',
  password: process.env.DB_PASSWORD || 'eaMlT6SYgNJowjv4XYw7A2GarihOWYzy',
  database: process.env.DB_NAME || 'realestatedb_fcd3',
  migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  entities: [path.join(__dirname, '..', '**', '*.entity.{js,ts}')],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  migrationsRun: false,
  dropSchema: false,
  ssl: { rejectUnauthorized: false },  // Always enable SSL for remote DBs
});