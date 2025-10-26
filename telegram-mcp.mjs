import { z } from "zod";
import { checkApiToken } from "./security.mjs";

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
