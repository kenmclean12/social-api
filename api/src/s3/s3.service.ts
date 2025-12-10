import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.publicBase = process.env.S3_PUBLIC!;

    this.s3 = new S3Client({
      region: process.env.S3_REGION!,
      endpoint: process.env.S3_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  async getPresignedUploadUrl(
    filename: string,
    mimeType: string,
  ): Promise<string> {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      throw new Error('S3_BUCKET env variable is missing');
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: mimeType,
    });

    const url: string = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5,
    });

    return url;
  }

  getPublicUrl(filename: string): string {
    return `${process.env.S3_PUBLIC}/${filename}`;
  }
}
