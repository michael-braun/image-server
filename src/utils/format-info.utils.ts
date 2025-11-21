import { FormatEnum } from "sharp";

const FORMAT_INFO: Record<'jpeg' | 'png' | 'webp' | 'avif', { mimeType: string; extension: string; sharpFormat: keyof FormatEnum; }> = {
  jpeg: {
    mimeType: 'image/jpeg',
    extension: 'jpg',
    sharpFormat: 'jpg',
  },
  png: {
    mimeType: 'image/png',
    extension: 'png',
    sharpFormat: 'png',
  },
  webp: {
    mimeType: 'image/webp',
    extension: 'webp',
    sharpFormat: 'webp',
  },
  avif: {
    mimeType: 'image/avif',
    extension: 'avif',
    sharpFormat: 'avif',
  },
};

export function getFormatInfoBySharpFormat(format: keyof FormatEnum) {
  switch (format) {
    case 'jpg':
    case 'jpeg':
      return FORMAT_INFO.jpeg;
    case 'png':
      return FORMAT_INFO.png;
    case 'webp':
      return FORMAT_INFO.webp;
    default:
      throw new Error('unsupported file type');
  }
}

export function getFormatInfoByExtension(extension: string) {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return FORMAT_INFO.jpeg;
    case 'png':
      return FORMAT_INFO.png;
    default:
      throw new Error('unsupported extension');
  }
}

export function getFormatInfoByMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/jpg':
    case 'image/jpeg':
      return FORMAT_INFO.jpeg;
    case 'image/png':
      return FORMAT_INFO.png;
    case 'image/webp':
      return FORMAT_INFO.webp;
    case 'image/avif':
      return FORMAT_INFO.avif;
    default:
      throw new Error('unsupported mimeType');
  }
}
