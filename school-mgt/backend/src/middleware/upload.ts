import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new Error(`Unsupported file type "${file.mimetype}". Use JPG, PNG, WebP or PDF.`));
    }
    cb(null, true);
  },
});

/**
 * Attaches a single uploaded file to `req.file` and forwards errors to the
 * central error handler.
 */
export const signatureUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('signature')(req, res, (err: unknown) => {
    if (err) return next(err);
    next();
  });
};