/**
 * Startup environment variable validation.
 * Import this module early (e.g., in lib/db.ts) so that missing env vars
 * surface as a clear, descriptive error at boot time rather than as cryptic
 * runtime failures deep in request handlers.
 */

const REQUIRED_VARS = [
  "NEXTAUTH_SECRET",
] as const;

// GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are optional for dev (mock values
// are accepted by the CredentialsProvider), but warn if they look like mocks.
const RECOMMENDED_VARS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_URL",
] as const;

function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[VoTI] Missing required environment variables: ${missing.join(", ")}.\n` +
        `Copy .env.example to .env and fill in the missing values.`
    );
  }

  // Soft-warn for recommended vars (won't crash the app)
  for (const key of RECOMMENDED_VARS) {
    const value = process.env[key];
    if (!value || value.startsWith("MOCK_")) {
      console.warn(
        `[VoTI] Warning: ${key} is not set or uses a mock value. ` +
          `Google OAuth login will not work until this is configured.`
      );
    }
  }
}

// Only validate on the server side (guards against Next.js client bundle)
if (typeof window === "undefined") {
  validateEnv();
}
