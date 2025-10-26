import { auth } from 'express-oauth2-jwt-bearer';
import "dotenv/config";

let cachedJwtCheck;

export function createJwtCheck() {
  if (cachedJwtCheck) {
    return cachedJwtCheck;
  }

  // Se AUTH_METHOD não estiver definido, o padrão é 'apikey'
  const authMethod = process.env.AUTH_METHOD || 'apikey';

  if (authMethod === 'oauth') {
    const issuerBaseURL = process.env.OAUTH_ISSUER_BASE_URL;
    const audience = process.env.OAUTH_AUDIENCE;
    if (!issuerBaseURL || !audience) {
      // Interrompe o início se não estiver configurado para oauth
      throw new Error('Por favor, defina OAUTH_ISSUER_BASE_URL e OAUTH_AUDIENCE no ambiente para autenticação oauth');
    }

    cachedJwtCheck = auth({
      audience,
      issuerBaseURL,
      tokenSigningAlg: 'RS256'
    });
  } else {
    // Para 'apikey', retorna um middleware que simplesmente passa para o próximo
    // A verificação do token de API será feita no nível da ferramenta
    cachedJwtCheck = (req, res, next) => next();
  }

  return cachedJwtCheck;
}
