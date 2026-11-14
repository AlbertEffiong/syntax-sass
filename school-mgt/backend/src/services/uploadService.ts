import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export interface UploadedFile {
  fileName: string;
  contentType: string;
  size: number;
  /** When S3 is configured, a public URL the browser can render. */
  url?: string;
  /** When S3 is NOT configured, the raw base64 payload to store in the document. */
  contentBase64?: string;
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

let s3: S3Client | null = null;
function getS3(): S3Client | null {
  if (s3) return s3;
  const { endpoint, region, bucket, accessKeyId, secretAccessKey } = env.s3;
  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) return null;
  s3 = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // Supabase storage requires path-style URLs
  });
  return s3;
}

export function uploadConfigured(): boolean {
  return !!getS3();
}

/**
 * Validates a multipart upload and stores it. When S3 is configured the file is
 * pushed to the bucket and a public URL is returned; otherwise the base64
 * payload is returned for the caller to persist in the document.
 */
export async function storeUpload(file: Express.Multer.File): Promise<UploadedFile> {
  if (!file) throw new Error('No file provided.');
  if (!ALLOWED.includes(file.mimetype)) {
    throw new Error(`Unsupported file type "${file.mimetype}". Use JPG, PNG, WebP or PDF.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File too large. Maximum size is 5 MB.');
  }

  const client = getS3();
  if (client) {
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.originalname}`;
    await client.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );
    const publicBase = env.s3.publicUrl?.replace(/\/$/, '') || `${env.s3.endpoint!.replace(/\/$/, '')}/${env.s3.bucket}`;
    return {
      fileName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      url: `${publicBase}/${key}`,
    };
  }

  // Fallback: store base64 in the document (used in dev / when S3 is unset).
  return {
    fileName: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    contentBase64: file.buffer.toString('base64'),
  };
}