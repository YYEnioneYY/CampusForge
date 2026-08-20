import {
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  getSignedUrl,
} from '@aws-sdk/s3-request-presigner';

import {
  S3_INTERNAL_CLIENT,
  S3_UPLOAD_CLIENT,
} from './storage.constants';

@Injectable()
export class StorageService {
  readonly bucket: string;

  constructor(
    @Inject(S3_INTERNAL_CLIENT)
    readonly internalClient: S3Client,

    @Inject(S3_UPLOAD_CLIENT)
    readonly uploadClient: S3Client,

    private readonly configService:
      ConfigService,
  ) {
    this.bucket =
      this.configService.getOrThrow<string>(
        'S3_PUBLIC_BUCKET',
      );
  }

  async headObject(
    objectKey: string,
  ) {
    return this.internalClient.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }

  async createUploadUrl(
    objectKey: string,
    contentType: string,
  ): Promise<string> {
    const expiresIn =
      this.configService.getOrThrow<number>(
        'S3_UPLOAD_URL_EXPIRES_IN',
      );
  
    const command =
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        ContentType: contentType,
      });
  
    return getSignedUrl(
      this.uploadClient,
      command,
      {
        expiresIn,
      },
    );
  }
}