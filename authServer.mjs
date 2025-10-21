import Provider from 'oidc-provider';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple in-memory adapter for development purposes
const ADAPTER = (name) => {
  const memory = new Map();
  return {
    async upsert(id, payload, expiresIn) {
      memory.set(id, { payload, ...(expiresIn ? { expiresAt: Date.now() + expiresIn * 1000 } : undefined) });
    },
    async find(id) {
      const stored = memory.get(id);
      if (!stored) return undefined;
      return { ...stored, ...(stored.expiresAt < Date.now() ? { consumed: Date.now() } : undefined) };
    },
    async findByUserCode(userCode) {
      for (const stored of memory.values()) {
        if (stored.payload.userCode === userCode) return this.find(stored.payload.jti);
      }
      return undefined;
    },
    async findByUid(uid) {
      for (const stored of memory.values()) {
        if (stored.payload.uid === uid) return this.find(stored.payload.jti);
      }
      return undefined;
    },
    async consume(id) {
      memory.get(id).consumed = Date.now();
    },
    async destroy(id) {
      memory.delete(id);
    },
    async revokeByGrantId(grantId) {
      for (const [id, stored] of memory.entries()) {
        if (stored.payload.grantId === grantId) memory.delete(id);
      }
    },
  };
};

export function createOIDCProvider(issuer) {
  const configuration = {
    adapter: ADAPTER,
    clients: [], // Dynamic registration only
    pkce: {
      required: true,
    },
    features: {
      dPoP: { enabled: true },
      registration: {
        enabled: true,
      },
      devInteractions: { enabled: false },
    },
    cookies: {
      keys: process.env.COOKIE_KEYS.split(','),
    },
    // OIDC-conformant settings
    scopes: ['openid', 'offline_access'],
    clientDefaults: {
      grant_types: ['authorization_code'],
      id_token_signed_response_alg: 'RS256',
      response_types: ['code'],
      token_endpoint_auth_method: 'none', // public clients
    },
    // Simple login and consent views
    renderError(ctx, out, error) {
      ctx.type = 'html';
      ctx.body = `<!DOCTYPE html>... an error occurred ...</html>`;
    },
    findAccount: async (ctx, id) => {
      // Dummy account finding logic
      return {
        accountId: id,
        async claims() { return { sub: id }; },
      };
    },
    interactions: {
      url(ctx, interaction) {
        return `/interaction/${interaction.uid}`;
      },
    },
    jwks: {
      keys: [JSON.parse(process.env.JWKS_KEY)],
    },
  };

  const oidc = new Provider(issuer, configuration);

  oidc.proxy = true; // tell koa to trust X-Forwarded-* headers

  return oidc;
}