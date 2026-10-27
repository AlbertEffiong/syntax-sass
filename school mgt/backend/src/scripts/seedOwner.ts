import { env } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { Owner } from '../models/Owner';
import { hashPassword, isStrongPassword } from '../utils/password';

/**
 * One-off bootstrap: creates the initial SaaS Owner from environment variables.
 * Safe to re-run — it will not overwrite an existing owner.
 *
 *   npm run seed:owner
 */
async function seedOwner(): Promise<void> {
  const email = (process.env.OWNER_EMAIL ?? 'owner@syntaxsaas.io').toLowerCase();
  const name = process.env.OWNER_NAME ?? 'SaaS Owner';
  const password = process.env.OWNER_PASSWORD ?? 'ChangeMe@123';

  if (!isStrongPassword(password)) {
    throw new Error('OWNER_PASSWORD does not satisfy the strong password policy.');
  }

  await connectDatabase();

  const existing = await Owner.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`[seed] Owner already exists: ${email}`);
  } else {
    await Owner.create({ name, email, password: await hashPassword(password) });
    // eslint-disable-next-line no-console
    console.log(`[seed] Created owner ${email}`);
  }

  await disconnectDatabase();
  // eslint-disable-next-line no-console
  console.log(`[seed] Done (${env.nodeEnv}).`);
}

seedOwner().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  process.exit(1);
});
