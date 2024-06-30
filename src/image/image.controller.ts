import { Controller, Get, Headers, NotFoundException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from "../auth/public.decorator.js";
import { ConfigService } from "@nestjs/config";
import { ConfigNamingType } from "../types/config.type.js";
import { ImageService } from "./image.service.js";
import { getFormatInfoByExtension, getFormatInfoByMimeType } from "../utils/format-info.utils.js";
import sharp from "sharp";
import fs from 'node:fs/promises';
import { CacheService } from "../cache/cache.service.js";
import { CacheType } from "../cache/cache.enum.js";


@Controller('images')
export class ImageController {
  constructor(
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
    private readonly cacheService: CacheService,
  ) {
  }

  @Public()
  @Get('*')
  public async getImage(
    @Req() req: Request,
    @Headers() headers,
    @Res() res: Response,
  ) {
    const rawSlug = req.params[0];

    const namingOptions = this.configService.get<ConfigNamingType>('naming');
    const convertedPath = namingOptions.path
      .replaceAll('/', '\\/')
      .replaceAll('.', '\\.')
      .replace('##id##', '(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})')
      .replace('##preset_alias##', '(?<preset_alias>[^/]+)')
      .replace('##ext##', '(?<ext>[A-Za-z0-9]+)')
      .replace('##name##', '(?<slug>.*)');

    const regex = new RegExp('^' + convertedPath + '$');
    const matchedSlug = rawSlug.match(regex);
    if (!matchedSlug) {
      throw new NotFoundException();
    }

    const { slug, preset_alias: presetAlias, ext, id } = matchedSlug.groups;
    const preferredMimeTypes = ext ? [getFormatInfoByExtension(ext).mimeType] : headers.accept.split(',').map(a => a.split(';')[0].trim());

    const resolveCacheKey = JSON.stringify([slug, presetAlias, preferredMimeTypes, id]);

    let resolveInfo = await this.cacheService.getOrCreateCache(
      CacheType.ResolvePath,
      [id, slug, presetAlias, preferredMimeTypes.join('_')],
      async () => {
        return await this.imageService.resolveImage({
          slug,
          presetAlias,
          id,
          preferredMimeTypes: preferredMimeTypes,
        });
      },
      {
        calculateSize: (value) => {
          return JSON.stringify(value).length;
        },
      }
    );

    if (resolveInfo.imageCaches?.[0]?.path) {
      const cachePath = resolveInfo.imageCaches[0].path;

      const cachedData = await this.cacheService.getOrCreateCache(
        CacheType.ImageData,
        [cachePath],
        async () => {
          const imageBuffer = await fs.readFile(cachePath);
          return {
            buffer: imageBuffer,
            meta: {
              contentType: resolveInfo.imageCaches[0].value.mimeType,
              imageCache: {
                imageId: resolveInfo.imageCaches[0].value.image.id,
                imagePresetId: resolveInfo.imageCaches[0].value.imagePreset.id,
                mimeType: resolveInfo.imageCaches[0].value.mimeType,
              },
            },
          };
        },
        {
          calculateSize: (value) => value.buffer.length + JSON.stringify(value.meta).length,
        }
      );

      res.set({
        'Content-Type': cachedData.meta.contentType,
        'Content-Length': cachedData.buffer.length,
      });
      res.send(cachedData.buffer);

      return;
    }

    const fileContent = await fs.readFile(resolveInfo.imagePath);

    const preferredFormat = getFormatInfoByMimeType(preferredMimeTypes[0]);

    const convertedImage = await sharp(fileContent)
      .resize({
        width: resolveInfo.preset.width,
        height: resolveInfo.preset.height,
        fit: resolveInfo.preset.algorithm,
      })
      .toFormat(preferredFormat.sharpFormat)
      .toBuffer();

    if (resolveInfo.preset.cached) {
      await this.imageService.saveCached(resolveInfo.image, convertedImage, resolveInfo.preset.alias, preferredFormat.mimeType);
    }

    res.set({
      'Content-Type': preferredFormat.mimeType,
      'Content-Length': convertedImage.length,
    });
    res.send(convertedImage);
    res.end();
  }
}