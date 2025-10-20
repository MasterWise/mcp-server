# MCP: Data e Hora por Extenso (pt-BR)

Este é um servidor de exemplo do [Model-Context Protocol](https://github.com/Model-Context-Protocol/mcp-spec) que expõe uma única ferramenta: `hora_atual_brasilia`, que retorna a data e hora atual no fuso de Brasília, em formatos de texto e JSON.

## Usando no ChatGPT

Para usar esta ferramenta com o ChatGPT, você precisa implantar este servidor e, em seguida, criar uma Ação do ChatGPT que aponte para a URL de implantação.

### Autenticação

Este servidor usa **OAuth 2.1** para autenticação, auto-hospedado com `oidc-provider`. Para configurar, você precisará configurar a seguinte variável de ambiente em sua implantação:

- `ISSUER_URL`: O URL público do seu serviço (por exemplo, `https://your-app-name.onrender.com`).
- `COOKIE_KEYS`: Uma lista de segredos de cookie separados por vírgula.
- `JWKS_KEY`: Uma chave JWK privada no formato JSON.

O servidor expõe todos os endpoints OAuth 2.1 necessários, incluindo o registro dinâmico de cliente e a descoberta.

**AVISO:** A implementação atual usa um adaptador de armazenamento em memória e uma lógica de localização de conta de dummy, adequada apenas para desenvolvimento. Para produção, você DEVE fornecer seu próprio adaptador e lógica `findAccount`.

## Desenvolvimento

Para executar os servidores localmente:

```bash
npm install
npm start
```

Isso iniciará o servidor de aplicação em `http://localhost:3000` e o servidor de autorização em `http://localhost:3001`.

Para executar os testes:

```bash
npm test
```
