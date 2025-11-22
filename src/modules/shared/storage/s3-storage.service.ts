import { Injectable } from '@nestjs/common';

@Injectable()
export class S3StorageService {
  private clientPromise: Promise<any>;
  private PutObjectCommand: any;
  private DeleteObjectCommand: any;

  constructor() {
    this.clientPromise = this.createClient();
  }

  private async createClient(): Promise<any> {
    const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    // Store commands as class properties
    this.PutObjectCommand = PutObjectCommand;
    this.DeleteObjectCommand = DeleteObjectCommand;

    const region = process.env.AWS_S3_REGION || process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    return new S3Client({
      region,
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
  }

  private buildPublicUrl(bucket: string, key: string): string {
    const base = process.env.AWS_S3_PUBLIC_URL;
    if (base) return `${base.replace(/\/+$/, '')}/${key}`;
    const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async upload(params: {
    bucket?: string;
    key: string;
    body: Buffer | Uint8Array | Blob | string | ReadableStream | any;
    contentType?: string;
    acl?: 'private' | 'public-read';
    metadata?: Record<string, string>;
  }) {
    const bucketName = params.bucket || process.env.AWS_S3_BUCKET;
    if (!bucketName) throw new Error('AWS_S3_BUCKET is not configured');

    const client = await this.clientPromise;

    await client.send(
      new this.PutObjectCommand({
        Bucket: bucketName,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ACL: params.acl || 'public-read',
        Metadata: params.metadata,
      }),
    );

    return {
      bucket: bucketName,
      key: params.key,
      url: this.buildPublicUrl(bucketName, params.key),
    };
  }

  async delete(params: { bucket?: string; key: string }) {
    const bucketName = params.bucket || process.env.AWS_S3_BUCKET;
    if (!bucketName) throw new Error('AWS_S3_BUCKET is not configured');

    const client = await this.clientPromise;

    await client.send(new this.DeleteObjectCommand({
      Bucket: bucketName,
      Key: params.key
    }));

    return { success: true };
  }
}
