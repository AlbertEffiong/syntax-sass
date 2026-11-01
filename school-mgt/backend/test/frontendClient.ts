/**
 * Frontend API-client contract test.
 *
 * Boots the real Express app against an ephemeral MongoDB and drives the
 * browser client (`../../api.js`, exposed as `window.SyntaxApi`) over HTTP in
 * bearer mode. This proves the client's envelope unwrapping, auth token
 * handling and typed errors match the backend contract.
 *
 * Run: npm run test:client
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'client-contract-secret';
process.env.BCRYPT_ROUNDS = '4';
process.env.RATE_LIMIT_MAX = '50';

import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Server } from 'http';

// The client is plain CommonJS JS (assigns module.exports when required).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = require('../../api.js');

const base = 'http://127.0.0.1:4211';

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, extra?: unknown): void {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}${extra === undefined ? '' : ` :: ${JSON.stringify(extra)}`}`);
  }
}

async function main(): Promise<void> {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri('syntax_saas_client_test');

  const { connectDatabase, disconnectDatabase } = await import('../src/config/db');
  const { createApp } = await import('../src/app');
  const { Owner } = await import('../src/models/Owner');
  const { hashPassword } = await import('../src/utils/password');

  await connectDatabase();

  const ownerPassword = 'Owner@12345';
  await Owner.create({
    name: 'Platform Owner',
    email: 'owner@syntaxsaas.io',
    password: await hashPassword(ownerPassword),
  });

  const app = createApp();
  const server: Server = app.listen(4211);

  // Point the browser client at the test server, using bearer-token auth.
  api.configure({ baseUrl: base, authMode: 'bearer' });

  try {
    // --- owner login -> token + user -------------------------------------
    const owner = await api.auth.login('owner', { email: 'owner@syntaxsaas.io', password: ownerPassword });
    check('client owner login returns token', typeof owner.token === 'string' && owner.token.length > 0, owner);
    check('client stores bearer token', api.getToken() === owner.token);
    check('client owner login returns user email', owner.user && owner.user.email === 'owner@syntaxsaas.io', owner.user);

    // --- authenticated GET (envelope -> data) ----------------------------
    const dash = await api.owner.dashboard();
    check('client owner.dashboard unwraps data.totalSchools', typeof dash.totalSchools === 'number', dash);

    // --- authenticated POST with bearer (no CSRF needed) -----------------
    const school = await api.auth.registerSchool({
      name: 'Bright Future Academy',
      email: 'admin@brightfuture.edu',
      password: 'Admin@12345',
      uniqueSchoolPrefix: 'BFA',
      principalName: 'Mrs. Ada Okon',
    });
    check('client registerSchool returns prefix BFA', school.uniqueSchoolPrefix === 'BFA', school);

    // --- logout clears the in-memory token -------------------------------
    await api.auth.logout();
    check('client logout clears token', api.getToken() === null);

    // --- admin login ------------------------------------------------------
    const admin = await api.auth.login('admin', { email: 'admin@brightfuture.edu', password: 'Admin@12345' });
    check('client admin login returns school name', admin.user && admin.user.name === 'Bright Future Academy', admin.user);

    const settings = await api.admin.getSchool();
    check('client admin.getSchool returns name', settings.name === 'Bright Future Academy', settings);

    // --- typed error on bad credentials ----------------------------------
    let thrown: any = null;
    try {
      await api.auth.login('admin', { email: 'admin@brightfuture.edu', password: 'wrong-password' });
    } catch (err) {
      thrown = err;
    }
    check(
      'client wrong password throws ApiError 401 INVALID_CREDENTIALS',
      thrown && thrown.name === 'ApiError' && thrown.status === 401 && thrown.code === 'INVALID_CREDENTIALS',
      thrown && { name: thrown.name, status: thrown.status, code: thrown.code },
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDatabase();
    await mongo.stop();
  }

  console.log(`\n${failed === 0 ? 'ALL PASS' : 'FAILURES'} — ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
