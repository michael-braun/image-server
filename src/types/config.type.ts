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
