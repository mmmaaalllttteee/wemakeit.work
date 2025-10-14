import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'wmiw_user',
  password: process.env.DB_PASSWORD || 'wmiw_dev_pass',
  database: process.env.DB_DATABASE || 'wmiw_dev',
  entities: [`${__dirname  }/../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname  }/../migrations/*{.ts,.js}`],
  synchronize: process.env.NODE_ENV === 'development', // ONLY for dev
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Export DataSource for TypeORM CLI
export const AppDataSource = new DataSource(databaseConfig as DataSourceOptions);
