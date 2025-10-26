import "dotenv/config";

export function checkApiToken(token) {
  const apiToken = process.env.MCP_API_TOKEN;

  if (!apiToken) {
    throw new Error("Variável de ambiente MCP_API_TOKEN não configurada.");
  }

  if (!token || token !== apiToken) {
    throw new Error("Token de API inválido ou não fornecido.");
  }
}
