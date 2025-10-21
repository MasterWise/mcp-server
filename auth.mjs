import { auth } from 'express-oauth2-jwt-bearer';

let cachedJwtCheck;

export function createJwtCheck() {
  if (cachedJwtCheck) {
    return cachedJwtCheck;
  }

  const issuerBaseURL = process.env.OAUTH_ISSUER_BASE_URL;
  const audience = process.env.OAUTH_AUDIENCE;
  if (!issuerBaseURL || !audience) {
    // block startup if not configured
    throw new Error('Please define OAUTH_ISSUER_BASE_URL and OAUTH_AUDIENCE in environment');
  }

  cachedJwtCheck = auth({
    audience,
    issuerBaseURL,
    tokenSigningAlg: 'RS256'
  });

  return cachedJwtCheck;
}
