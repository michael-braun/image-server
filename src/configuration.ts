import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { resolve } from 'node:path';
import Joi from "joi";
import { ConfigType } from "./types/config.type.js";

const YAML_CONFIG_FILENAME = 'config.yaml';

const CONFIG_VALIDATION_SCHEMA = Joi.object({
  auth: Joi.alternatives(
    Joi.object({
      type: Joi.string()
        .valid('static')
        .required(),
      secret: Joi.string()
        .required(),
      users: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          username: Joi.string().required(),
          password: Joi.string().required(),
          grants: Joi.array().items(
            Joi.string()
              .valid('manage_images')
              .required(),
          ).required(),
        })
      ),
    }),
  ),
  images: Joi.object({
    presets: Joi.array().items(
      Joi.object({
        alias: Joi.string().required(),
        width: Joi.number().required(),
        height: Joi.number().required(),
        algorithm: Joi.string()
          .valid('contain')
          .required(),
        conversion: Joi.string()
          .valid('on_demand')
          .required(),
        cached: Joi.boolean()
          .required(),
      })
    )
  }),
  database: Joi.alternatives().try(
    Joi.object({
      type: Joi.string().valid('sqlite').required(),
      database: Joi.string().required(),
    }),
    Joi.object({
      type: Joi.string().valid('cockroachdb').required(),
      host: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      database: Joi.string().required(),
      port: Joi.number(),
      ssl: Joi.object({
        rejectUnauthorized: Joi.boolean(),
        ca: Joi.string(),
        key: Joi.string(),
        cert: Joi.string(),
      }),
    }),
  ),
  naming: Joi.object({
    path: Joi.string().required(),
    type: Joi.string().valid('named').required(),
  }),
  storage: Joi.object({
    data: Joi.string().required(),
    cache: Joi.string().required(),
  }).default({}),
  caching: Joi.object({
    memory: Joi.alternatives().try(
      Joi.object({
        enabled: Joi.boolean().valid(false),
      }),
      Joi.object({
        enabled: Joi.boolean().valid(true),
        caches: Joi.object({
          resolve_path: Joi.object({
            ttl: Joi.alternatives().try(
              Joi.string().valid('Infinity'),
              Joi.number().positive(),
            ),
          }),
          image_data: Joi.object({
            ttl: Joi.alternatives().try(
              Joi.string().valid('Infinity'),
              Joi.number().positive(),
            ),
          }),
        }),
      }),
    ),
  }),
});

export default () => {
  const config = yaml.load(
    readFileSync(resolve(process.cwd(), process.env.CONFIG_FILE_PATH || YAML_CONFIG_FILENAME), 'utf8'),
  ) as ConfigType;

  config.storage = {
    data: process.env.DATA_PATH,
    cache: process.env.CACHE_PATH,
    ...config.storage,
  };

  const valid = CONFIG_VALIDATION_SCHEMA.validate(config, { abortEarly: false, });
  if (valid.error) {
    console.error('error while validating config', valid.error.details);
    throw new Error('invalid config');
  }

  return config;
};
