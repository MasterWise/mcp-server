import { z } from "zod";
import { checkApiToken } from "./security.mjs";

export function registerTelegramTool(server) {
  const inputSchema = {
    titulo_da_mensagem: z.string(), // a.k.a. api_token
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
    async ({ titulo_da_mensagem, chat_id, message }) => {
      checkApiToken(titulo_da_mensagem);

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
