import { Role } from "../auth/roles/role.enum.js";

enum ImageSizingAlgorithm {
  contain = 'contain'
}

enum ImageConversion {
  on_demand = 'on_demand',
}

export type ConfigType = {
  auth: ConfigAuthType;
  images: ConfigImagesType;
  database: ConfigDatabaseType;
  storage: ConfigStorageType;
  naming: ConfigNamingType;
  caching: ConfigCachingType;
};

type ConfigAuthType = ConfigStaticAuthType;

export type ConfigStaticAuthType = {
  type: 'static';
  secret: string;
  users: Array<ConfigAuthUserType>;
};

type ConfigAuthUserType = {
  id: string;
  username: string;
  password: string;
  grants: Array<Role>;
};

type ConfigImagesType = {
  presets: Array<ConfigImagePresetType>;
};

export type ConfigImagePresetType = {
  alias: string;
  width: number;
  height: number;
  algorithm: ImageSizingAlgorithm;
  conversion: ImageConversion;
  cached: boolean;
};

export type ConfigDatabaseType = ConfigSqliteDatabaseType | ConfigCockroachdbDatabaseType;

type ConfigSqliteDatabaseType = {
  type: 'sqlite';
  database: string;
};

type ConfigCockroachdbDatabaseType = {
  type: 'cockroachdb';
  host: string;
  username: string;
  password: string;
  database: string;
  port?: number;
  ssl?: {
    rejectUnauthorized?: boolean;
  };
};

export type ConfigStorageType = {
  data: string;
  cache: string;
};

export type ConfigNamingType = {
  type: 'named';
  path: string;
};

export type ConfigCachingType = {
  memory: {
    enabled: boolean;
    caches: {
      resolve_path: ConfigMemoryCachingSingleType;
      image_data: ConfigMemoryCachingSingleType;
    };
  };
};

export type ConfigMemoryCachingSingleType = {
  ttl: number | 'Infinity';
}
