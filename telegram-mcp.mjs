import { z } from "zod";
import { checkApiToken } from "./security.mjs";
import fetch from "node-fetch";

export const telegramApi = {
  async sendTelegramMessage(chat_id, message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN não está definido nas variáveis de ambiente.");
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat_id,
          text: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao enviar mensagem para o Telegram: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Falha ao enviar mensagem para o Telegram:", error);
      throw error;
    }
  }
};

export function registerTelegramTool(server) {
  const inputSchema = {
    id_integracao: z.string().describe("Identificador da interação."),
    chat_id: z.string().describe("ID do chat do Telegram para onde a mensagem será enviada."),
    message: z.string().describe("O conteúdo da mensagem a ser enviada."),
  };

  server.registerTool(
    "send_telegram_message",
    {
      title: "Enviar mensagem para o Telegram",
      description: "Envia uma mensagem para um chat específico no Telegram.",
      inputSchema,
    },
    async ({ id_integracao, chat_id, message }) => {
      checkApiToken(id_integracao);

      await telegramApi.sendTelegramMessage(chat_id, message);

      const successMessage = "mensagem enviada com sucesso";

      return {
        content: [{ type: "text", text: successMessage }],
        structuredContent: {
          success: true,
          message: successMessage,
          chat_id,
        },
      };
    }
  );

  // Ferramenta para enviar mensagem para o Jhon
  const jhonInputSchema = {
    id_integracao: z.string().describe("Identificador da interação."),
    message: z.string().describe("O conteúdo da mensagem a ser enviada."),
  };

  server.registerTool(
    "send_message_to_jhon",
    {
      title: "Enviar mensagem para o Jhon",
      description: "Envia uma mensagem para o Jhon no Telegram.",
      inputSchema: jhonInputSchema,
    },
    async ({ id_integracao, message }) => {
      checkApiToken(id_integracao);
      const chatId = process.env.CHAT_ID_JHON;
      if (!chatId) {
        throw new Error("CHAT_ID_JHON não está definido nas variáveis de ambiente.");
      }
      await telegramApi.sendTelegramMessage(chatId, message);

      const successMessage = "mensagem enviada com sucesso para o Jhon";

      return {
        content: [{ type: "text", text: successMessage }],
        structuredContent: {
          success: true,
          message: successMessage,
          chat_id: chatId,
        },
      };
    }
  );

  // Ferramenta para enviar mensagem para a Renata
  const renataInputSchema = {
    id_integracao: z.string().describe("Identificador da interação."),
    message: z.string().describe("O conteúdo da mensagem a ser enviada."),
  };

  server.registerTool(
    "send_message_to_renata",
    {
      title: "Enviar mensagem para a Renata",
      description: "Envia uma mensagem para a Renata no Telegram.",
      inputSchema: renataInputSchema,
    },
    async ({ id_integracao, message }) => {
      checkApiToken(id_integracao);
      const chatId = process.env.CHAT_ID_RENATA;
      if (!chatId) {
        throw new Error("CHAT_ID_RENATA não está definido nas variáveis de ambiente.");
      }
      await telegramApi.sendTelegramMessage(chatId, message);

      const successMessage = "mensagem enviada com sucesso para a Renata";

      return {
        content: [{ type: "text", text: successMessage }],
        structuredContent: {
          success: true,
          message: successMessage,
          chat_id: chatId,
        },
      };
    }
  );
}
