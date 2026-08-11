// Mint a valid NextAuth session token for a target user using the app's real
// secret, so we can exercise the authenticated upload route end-to-end.
const { encode } = require('next-auth/jwt');
const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const userId = process.argv[2];
if (!userId) {
  console.error('usage: AUTH_SECRET=... node make-token.cjs <userId>');
  process.exit(1);
}
if (!secret) {
  console.error('AUTH_SECRET is not set.');
  process.exit(1);
}
(async () => {
  const token = await encode({
    token: { sub: userId, name: 'E2E Test', email: 'e2e-test@example.com' },
    secret,
    maxAge: 60 * 60,
  });
  console.log(token);
})().catch((e) => { console.error(e); process.exit(1); });
