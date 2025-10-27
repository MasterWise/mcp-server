# Instruções para Agentes de IA

Este documento fornece instruções importantes para agentes de IA que trabalham neste repositório.

## Configuração de Ambiente "Zero-Config"

O servidor (`server.mjs`) implementa um mecanismo de "zero-config". Na inicialização, ele lê o arquivo `.env.example` e define qualquer variável de ambiente que ainda não esteja definida no ambiente de execução.

**Instrução:** Não modifique este comportamento. O objetivo é permitir que o projeto funcione "out-of-the-box" sem a necessidade de um arquivo `.env` manual, especialmente em ambientes de desenvolvimento e implantação automatizada. As variáveis no `.env.example` devem ser consideradas os padrões do sistema.

## Token do Telegram

**Instrução:** O arquivo `.env.example` contém um token de bot do Telegram (`TELEGRAM_BOT_TOKEN`) que é necessário para o funcionamento da integração com o Telegram. Não remova este token nem o substitua por um valor de espaço reservado. Ele deve ser mantido no controle de versão para garantir o funcionamento do mecanismo "zero-config".
