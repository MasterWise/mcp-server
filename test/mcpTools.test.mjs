import test from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import { createApp } from "../server.mjs";
import { telegramApi } from "../telegram-mcp.mjs";

test("MCP tools authentication with id_integracao", async (t) => {
  // Mock a função sendTelegramMessage
  const sendTelegramMessageStub = sinon.stub(telegramApi, "sendTelegramMessage").resolves({ ok: true });

  // Define as variáveis de ambiente para o teste
  process.env.MCP_API_TOKEN = "test-token";
  process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
  process.env.TELEGRAM_TEST_CHAT_ID = "test-chat-id";
  process.env.CHAT_ID_JHON = "jhon-chat-id";
  process.env.CHAT_ID_RENATA = "renata-chat-id";

  const { server } = createApp();
  const apiToken = process.env.MCP_API_TOKEN;

  const horaTool = server._registeredTools["hora_atual_brasilia"];
  const telegramTool = server._registeredTools["send_telegram_message"];
  const jhonTool = server._registeredTools["send_message_to_jhon"];
  const renataTool = server._registeredTools["send_message_to_renata"];

  // Test 'hora_atual_brasilia' tool
  const horaResult = await horaTool.callback({ id_integracao: apiToken });
  assert(horaResult.structuredContent.iso, "A ferramenta 'hora_atual_brasilia' deveria retornar um ISO date com um token válido.");

  // Test 'send_telegram_message' tool
  const testChatId = process.env.TELEGRAM_TEST_CHAT_ID;
  await telegramTool.callback({ id_integracao: apiToken, chat_id: testChatId, message: "Test message" });
  assert(sendTelegramMessageStub.calledWith(testChatId, "Test message"), "A função sendTelegramMessage deveria ser chamada com os argumentos corretos.");

  // Test 'send_message_to_jhon' tool
  await jhonTool.callback({ id_integracao: apiToken, message: "Test message for Jhon" });
  assert(sendTelegramMessageStub.calledWith(process.env.CHAT_ID_JHON, "Test message for Jhon"), "A função sendTelegramMessage deveria ser chamada com o chat ID do Jhon.");

  // Test 'send_message_to_renata' tool
  await renataTool.callback({ id_integracao: apiToken, message: "Test message for Renata" });
  assert(sendTelegramMessageStub.calledWith(process.env.CHAT_ID_RENATA, "Test message for Renata"), "A função sendTelegramMessage deveria ser chamada com o chat ID da Renata.");

  // Test with invalid token
  await assert.rejects(
    horaTool.callback({ id_integracao: "invalid-token" }),
    /Token de API inválido ou não fornecido./,
    "Deveria rejeitar um token inválido para 'hora_atual_brasilia'."
  );

  // Restaura a função original
  sendTelegramMessageStub.restore();
});
