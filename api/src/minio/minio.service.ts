import { Injectable } from '@nestjs/common';
import { Client as MinioClient } from 'minio';

@Injectable()
export class MinioService {
  private readonly client: MinioClient;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET!;
    this.publicBase = process.env.MINIO_PUBLIC!;

    const endpointUrl = new URL(process.env.MINIO_ENDPOINT!);

    this.client = new MinioClient({
      endPoint: endpointUrl.hostname,
      port:
        Number(endpointUrl.port) ||
        (endpointUrl.protocol === 'https:' ? 443 : 80),
      useSSL: endpointUrl.protocol === 'https:',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });
  }

  async getPresignedUploadUrl(filename: string): Promise<string> {
    return await this.client.presignedPutObject(this.bucket, filename, 60 * 5);
  }

  getPublicUrl(filename: string): string {
    return `${this.publicBase}/${filename}`;
  }
}
