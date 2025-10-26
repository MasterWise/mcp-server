import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server.mjs";

test("MCP tools authentication with id_integracao", async () => {
  const { server } = createApp();

  const apiToken = process.env.MCP_API_TOKEN || "test-token";
  process.env.MCP_API_TOKEN = apiToken;

  const horaTool = server._registeredTools["hora_atual_brasilia"];
  const telegramTool = server._registeredTools["send_telegram_message"];

  // Test 'hora_atual_brasilia' tool
  const horaResult = await horaTool.callback({
    id_integracao: apiToken,
  });
  assert(horaResult.structuredContent.iso, "A ferramenta 'hora_atual_brasilia' deveria retornar um ISO date com um token válido.");

  // Test 'send_telegram_message' tool
  const telegramResult = await telegramTool.callback({
    id_integracao: apiToken,
    chat_id: "12345",
    message: "Test message",
  });
  assert.deepStrictEqual(telegramResult.structuredContent, {
    success: true,
    message: "mensagem enviada com sucesso",
    chat_id: "12345",
  }, "A ferramenta 'send_telegram_message' deveria retornar sucesso com um token válido.");

  // Test with invalid token
  await assert.rejects(
    horaTool.callback({
      id_integracao: "invalid-token",
    }),
    /Token de API inválido ou não fornecido./,
    "Deveria rejeitar um token inválido para 'hora_atual_brasilia'."
  );
});
