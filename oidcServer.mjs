import { createOIDCProvider } from './authServer.mjs';
import { fileURLToPath } from 'node:url';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'node:path';
import render from 'koa-ejs';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = parseInt(process.env.OIDC_PORT || process.env.PORT || '3001', 10);
const ISSUER_URL = process.env.ISSUER_URL || `http://localhost:${port}`;

const app = new Koa();
app.use(bodyParser());

const oidc = createOIDCProvider(ISSUER_URL);

render(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false,
});

app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/interaction')) {
    if (ctx.method === 'GET') {
      const details = await oidc.interactionDetails(ctx.req, ctx.res);
      const { uid, prompt, params, client } = details;

      if (prompt.name === 'login') {
        await ctx.render('login', {
          uid,
          client,
          params,
          formAction: `/interaction/${uid}/login`,
        });
      } else {
        await ctx.render('interaction', {
          uid,
          client,
          params,
          prompts: details,
          formAction: `/interaction/${uid}/confirm`,
        });
      }
    } else if (ctx.method === 'POST') {
      const details = await oidc.interactionDetails(ctx.req, ctx.res);
      const { uid } = details;

      let result;
      if (ctx.path.endsWith('/login')) {
        result = {
          login: {
            accountId: ctx.request.body.login,
          },
        };
      } else if (ctx.path.endsWith('/confirm')) {
        result = {
          consent: {},
        };
      } else if (ctx.path.endsWith('/abort')) {
        result = {
          error: 'access_denied',
          error_description: 'End-user denied authorization',
        };
      }

      await oidc.interactionFinished(ctx.req, ctx.res, result, { mergeWithLastSubmission: ctx.path.endsWith('/confirm') });
    }
  } else {
    await next();
  }
});

app.use(oidc.callback());

const server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`oidc-provider listening on port ${port}, check ${ISSUER_URL}/.well-known/openid-configuration`);
});
