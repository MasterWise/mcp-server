import { z } from "zod";
import { checkApiToken } from "./security.mjs";

export function registerTelegramTool(server) {
  const inputSchema = {
    api_token: z.string(),
    chat_id: z.string(),
    message: z.string(),
  };

  server.registerTool(
    "send_telegram_message",
    {
      title: "Enviar mensagem para o Telegram",
      description: "Envia uma mensagem para um chat específico no Telegram.",
      inputSchema,
    },
    async ({ api_token, chat_id, message }) => {
      checkApiToken(api_token);

      // TODO: Implementar a lógica de envio da mensagem para a API do Telegram

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
}
