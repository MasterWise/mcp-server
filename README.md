# MCP: Data e Hora por Extenso (pt-BR)

Este é um servidor de exemplo do [Model-Context Protocol](https://github.com/Model-Context-Protocol/mcp-spec) que expõe uma única ferramenta: `hora_atual_brasilia`, que retorna a data e hora atual no fuso de Brasília, em formatos de texto e JSON.

## Usando no ChatGPT

Para usar esta ferramenta com o ChatGPT, você precisa implantar este servidor e, em seguida, criar uma Ação do ChatGPT que aponte para a URL de implantação.

### Autenticação

Este servidor usa **OAuth 2.1** para autenticação, compatível com as Ações do ChatGPT. Para configurar, você precisará configurar as seguintes variáveis de ambiente em sua implantação:

- `OAUTH_ISSUER_BASE_URL`: O URL base do seu servidor de autorização OAuth (por exemplo, `https://your-tenant.us.auth0.com/`).
- `OAUTH_AUDIENCE`: O identificador de público para sua API (por exemplo, `https://api.example.com/`).

O servidor expõe um endpoint de descoberta em `/.well-known/oauth-protected-resource` para que o ChatGPT possa encontrar automaticamente seu servidor de autorização.

## Desenvolvimento

Para executar o servidor localmente:

```bash
npm install
npm start
```

Isso iniciará o servidor em `http://localhost:3000`.

Para executar os testes:

```bash
npm test
```
