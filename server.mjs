import express from "express";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

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
function horaAtualBrasilia() {
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
const app = express();
app.use(express.json());

const server = new McpServer({ name: "mcp-data-hora-ptbr", version: "1.0.0" });

server.registerTool(
  "hora_atual_brasilia",
  {
    title: "Hora de Brasília",
    description: "Retorna a hora atual do horário de Brasília (Brasil).",
    outputSchema: {
      texto: z.string(),
      textoPorExtenso: z.string(),
      iso: z.string(),
      timeZone: z.string()
    }
  },
  async () => {
    const out = horaAtualBrasilia();
    return {
      content: [
        { type: "text", text: out.texto },
        { type: "text", text: out.textoPorExtenso }
      ],
      structuredContent: out,
    };
  }
);

// Auth opcional via Bearer (defina MCP_TOKEN no Render)
const TOKEN = process.env.MCP_TOKEN;
function auth(req, res, next) {
  if (!TOKEN) return next();
  const authz = req.get("authorization") || "";
  if (authz !== `Bearer ${TOKEN}`) {
    res.setHeader("www-authenticate", "Bearer");
    return res.status(401).send("Unauthorized");
  }
  next();
}

// Endpoint MCP (Streamable HTTP)
app.post("/mcp", auth, async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Rota de “preview” amigável (não-MCP) — útil pra teste rápido no navegador
app.get("/", (_req, res) => {
  const out = horaAtualBrasilia();
  res
    .type("text/plain")
    .send(`${out.texto}\n${out.textoPorExtenso}`);
});

const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port, () => {
  console.log(`MCP pronto em http://localhost:${port}/mcp  — preview: http://localhost:${port}/`);
});
