# MCP: Data e Hora por Extenso (pt-BR)

Este projeto é um servidor que implementa o Model Context Protocol (MCP) para fornecer uma ferramenta que retorna a data e a hora atuais por extenso em português do Brasil (horário de Brasília).

## Como executar

1. **Instale as dependências:**
   ```sh
   npm install
   ```
2. **Inicie o servidor:**
   ```sh
   npm start
   ```

O servidor estará disponível em `http://localhost:3000`.

- **Endpoint MCP:** `POST /mcp`
- **Endpoint de preview:** `GET /`

## Deploy

O projeto está configurado para deploy automático no Render através do arquivo `render.yaml`.
