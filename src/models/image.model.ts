import { ApiProperty } from "@nestjs/swagger";

export class ImageSlugDto {
  @ApiProperty()
  slug: string;
}

export class ImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  md5: string;

  @ApiProperty()
  hasAlpha: boolean;

  @ApiProperty()
  hasAnimation: boolean;

  @ApiProperty({
    required: false,
  })
  slugs?: Array<ImageSlugDto>;

  @ApiProperty()
  creationTime: Date;

  @ApiProperty()
  deletionTime: Date;
}
