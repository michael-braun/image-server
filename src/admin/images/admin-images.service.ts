import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from 'express';
import { Repository } from "typeorm";
import { Image } from "../../database/entities/image.entity.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { ConfigService } from "@nestjs/config";
import { ConfigStorageType } from "../../types/config.type.js";
import sharp, { FormatEnum } from "sharp";
import crypto from 'node:crypto';
import { Slug } from "../../database/entities/slug.entity.js";
import slugify from "slugify";
import { getFormatInfoBySharpFormat } from "../../utils/format-info.utils.js";

@Injectable()
export class AdminImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(Slug)
    private slugsRepository: Repository<Slug>,
    private readonly configService: ConfigService,
  ) {
  }

  async list() {
    return this.imagesRepository.find();
  }


  async getById(id: string) {
    return this.imagesRepository.findOne({
      where: {
        id,
      },
    });
  }

  async upload(request: Request, options: { path?: string; }) {
    const id = crypto.randomUUID();
    const creationTime = new Date(Date.now());

    const slug = options?.path ? slugify.default(options.path, {
      remove: /[^\w\s$*_+~.()'"!\-:@\/]+/g,
    }) : undefined;

    const slugExists = await this.slugsRepository.exists({
      where: {
        slug,
      },
    });
    if (slugExists) {
      throw new ConflictException('slug already exists');
    }

    const basePath = this.getImageDirectory(creationTime);

    await fs.promises.mkdir(basePath, {
      recursive: true,
    });

    const buffer = await this.streamToBuffer(request);

    const metadata = await sharp(buffer)
      .metadata();

    const formatInfo = getFormatInfoBySharpFormat(metadata.format);

    const filePath = path.resolve(basePath, `${id}.${formatInfo.extension}`);

    await fs.promises.writeFile(filePath, buffer);

    const hashed = crypto
      .createHash('md5')
      .update(buffer)
      .digest("base64");

    const createdImage = this.imagesRepository.create({
      id,
      mimeType: formatInfo.mimeType,
      fileSize: buffer.length,
      hasAlpha: metadata.hasAlpha ?? false,
      hasAnimation: !!(metadata.pages && metadata.delay?.length > 1),
      width: metadata.width,
      height: metadata.height,
      md5: hashed,
      creationTime,
    });

    const savedImage = await this.imagesRepository.save(createdImage);

    if (options.path) {
      await this.slugsRepository.save({
        image: savedImage,
        slug,
      });
    }

    return {
      id,
      slug,
    };
  }

  private async streamToBuffer(request: Request) {
    const buffers = [];

    // node.js readable streams implement the async iterator protocol
    for await (const data of request) {
      buffers.push(data);
    }

    return Buffer.concat(buffers);
  }

  private getImageDirectory(creationTime: Date) {
    const year = creationTime.getUTCFullYear();
    const month = creationTime.getUTCMonth();
    const day = creationTime.getUTCDate();

    const dataPath = this.configService.get<ConfigStorageType['data']>('storage.data');
    return path.resolve(dataPath, year.toString(), month.toString().padStart(2, '0'), day.toString().padStart(2, '0'));
  }
}
