import { AuthUser } from './index';
import { ISchoolDocument } from '../models/School';

/**
 * Ambient augmentation of the Express request so downstream middleware and
 * controllers can read the authenticated principal and resolved tenant without
 * casting. `tenantSchoolId` is the IDOR-safe school id that controllers MUST
 * use when querying tenant-owned collections.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantSchoolId?: string;
      school?: ISchoolDocument;
      /** Correlation id assigned per request (echoed as x-request-id). */
      id?: string;
    }
  }
}

export {};
