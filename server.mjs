import fs from "fs";
import path from "path";
import express from "express";
import { z } from "zod";

// --- Início do processo de inicialização "Zero-Config" ---
// Carrega as variáveis de ambiente do .env.example se não estiverem definidas
const envExamplePath = path.resolve(process.cwd(), ".env.example");
if (fs.existsSync(envExamplePath)) {
  const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
  const lines = envExampleContent.split("\n");

  for (const line of lines) {
    // Ignora comentários e linhas vazias
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }

    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim();

      // Define a variável de ambiente apenas se não estiver definida
      if (!process.env[key] && value) {
        process.env[key] = value;
      }
    }
  }
}
// --- Fim do processo de inicialização ---
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import fetch from "node-fetch";
import { fileURLToPath } from "node:url";
import { createJwtCheck } from "./auth.mjs";
import { checkApiToken } from "./security.mjs";
import { registerTelegramTool } from "./telegram-mcp.mjs";

/** ========= util: números por extenso (pt-BR) ========= */
const UNITS = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove"];
const TEENS = ["dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
const TENS  = [,"","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];

function numeroMenorQueCem(n) {
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  const d = Math.floor(n / 10), r = n % 10;
  return r ? `${TENS[d]} e ${UNITS[r]}` : TENS[d];
}
function numeroPorExtenso0a59(n) {
  if (n < 60) return numeroMenorQueCem(n);
  throw new Error("faixa não suportada");
}
function ajustaFeminino(frase) {
  // transforma “um/ dois” → “uma/ duas” quando necessário (horas)
  return frase
    .replace(/(^|\s)um(\s|$)/g, "$1uma$2")
    .replace(/(^|\s)dois(\s|$)/g, "$1duas$2");
}
function anoPorExtenso(ano) {
  if (ano >= 2000 && ano <= 2099) {
    const resto = ano - 2000;
    return resto ? `dois mil e ${numeroMenorQueCem(resto)}` : "dois mil";
  }
  if (ano >= 1900 && ano <= 1999) {
    const resto = ano - 1900;
    return resto ? `mil novecentos e ${numeroMenorQueCem(resto)}` : "mil novecentos";
  }
  // fallback simples
  return String(ano);
}
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/** ========= formatter principal ========= */
export function dataHoraPorExtenso() {
  const timeZone = "America/Sao_Paulo";
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZoneName: "short"
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
  const horaNum = parseInt(parts.hour, 10);
  const minNum  = parseInt(parts.minute, 10);
  const segNum  = parseInt(parts.second, 10);

  let horaExt = numeroPorExtenso0a59(horaNum);
  horaExt = ajustaFeminino(horaExt); // “vinte e uma” horas, etc.
  const minExt = numeroPorExtenso0a59(minNum);
  const segExt = numeroPorExtenso0a59(segNum);

  const texto =
    `Horário de Brasília: ${parts.hour.padStart(2, "0")}:${parts.minute.padStart(2, "0")}:${parts.second.padStart(2, "0")} (${parts.timeZoneName}).`;

  const textoPorExtenso =
    `Horário de Brasília: ${capitalize(horaExt)} ${horaNum === 1 ? "hora" : "horas"}, ` +
    `${minExt} ${minNum === 1 ? "minuto" : "minutos"} e ` +
    `${segExt} ${segNum === 1 ? "segundo" : "segundos"} (${parts.timeZoneName}).`;

  return { texto, textoPorExtenso, iso: now.toISOString(), timeZone };
}

/** ========= MCP setup ========= */
const horaAtualBrasiliaOutputShape = {
  texto: z.string(),
  textoPorExtenso: z.string(),
  iso: z.string().datetime({ message: "Invalid ISO 8601 date string" }),
  timeZone: z.string(),
};

export const horaAtualBrasiliaOutputSchema = z.object(horaAtualBrasiliaOutputShape);


export function createApp() {
  const app = express();
  app.use(express.json());

  const server = new McpServer({ name: "mcp-data-hora-ptbr", version: "1.0.0" });

  server.registerTool(
    "hora_atual_brasilia",
    {
      title: "Data e hora por extenso (pt-BR)",
      description: "Retorna a data e a hora atuais por extenso em português do Brasil (horário de Brasília).",
      inputSchema: {
        id_integracao: z.string().describe("Identificador da interação."),
      },
      outputSchema: horaAtualBrasiliaOutputShape,
    },
    async ({ id_integracao }) => {
      checkApiToken(id_integracao);
      const out = horaAtualBrasiliaOutputSchema.parse(dataHoraPorExtenso());
      return {
        content: [
          { type: "text", text: out.texto },
          { type: "text", text: out.textoPorExtenso }
        ],
        structuredContent: out,
      };
    }
  );

  registerTelegramTool(server);

  // Endpoint MCP (Streamable HTTP)
  const jwtCheck = createJwtCheck();

  app.post("/mcp", jwtCheck, async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // ChatGPT OAuth discovery endpoint
  app.get("/.well-known/oauth-protected-resource", (_req, res) => {
    res.json({
      authorization_servers: [
        process.env.OAUTH_ISSUER_BASE_URL,
      ]
    });
  });

  // Rota de “preview” amigável (não-MCP) — útil pra teste rápido no navegador
  app.get("/", (_req, res) => {
    const out = dataHoraPorExtenso();
    res
      .type("text/plain")
      .send(`${out.texto}\n${out.textoPorExtenso}`);
  });

  // Rota de health check
  app.get("/health", async (_req, res) => {
    try {
      const response = await fetch("https://mcp-server-n0rx.onrender.com");
      if (response.ok) {
        res.status(200).send("ok");
      } else {
        res.status(response.status).send("health check falhou");
      }
    } catch (error) {
      res.status(500).send("health check falhou");
    }
  });

  return { app, server };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { app } = createApp();
  const port = parseInt(process.env.PORT || "3000", 10);
  app.listen(port, () => {
    console.log(`MCP pronto em http://localhost:${port}/mcp  — preview: http://localhost:${port}/`);
  });

  const healthCheckUrl = "https://mcp-server-n0rx.onrender.com/health";
  setInterval(async () => {
    try {
      const response = await fetch(healthCheckUrl);
      if (response.ok) {
        console.log("Health check: OK");
      } else {
        console.error(`Health check falhou: status ${response.status}`);
      }
    } catch (error) {
      console.error("Health check falhou:", error);
    }
  }, 5000);
}
