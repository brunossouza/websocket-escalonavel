# WebSocket Escalonável

> Infraestrutura NestJS + Socket.IO preparada para escalar horizontalmente com Redis e orquestração via Docker/Swarm.

## Visão Geral
- **Stack:** NestJS 11, Socket.IO, Redis adapter, TypeScript e Yarn.
- **Objetivo:** distribuir eventos WebSocket entre múltiplas instâncias compartilhando um broker Redis único, mantendo logs por host (`os.hostname()`).
- **Principais módulos:** `chat.gateway.ts` (rooms & broadcast), `redis-io.adapter.ts` (cluster), `app.module.ts` (injeção) e `index.html` (cliente leve).

## Requisitos
- Node.js 20+ e Yarn 1.x.
- Redis acessível via `REDIS_URL` (ex.: `redis://localhost:6379`).
- Docker >= 24 quando desejar usar o fluxo containerizado/Swarm.

## Configuração Rápida
```bash
yarn install
yarn start:dev                           # API + WebSocket com hot reload
REDIS_URL=redis://host:6379 yarn start:prod   # bundle compilado apontando para Redis externo
```

## Testes e Qualidade
```bash
yarn test        # unitários (Jest)
yarn test:e2e    # cenários e2e em /test
yarn test:cov    # relatório em /coverage
yarn lint        # ESLint com --fix automatizado
yarn format      # Prettier aplicado em src/ e test/
```

## Docker & Swarm
- `Dockerfile` gera imagem Node 20 enxuta com build multi-stage.
- `compose-swarm-stack.yml` demonstra múltiplas réplicas do app compartilhando o mesmo serviço Redis; ajuste `deploy.replicas` para escalar.
- Localmente, é possível testar com `docker compose up --build` (certifique-se de expor a porta configurada em `PORT`).

## Variáveis Importantes
| Variável | Descrição | Default |
| --- | --- | --- |
| `PORT` | Porta HTTP/WebSocket exposta pelo Nest | `3000` |
| `REDIS_URL` | Endpoint Redis usado pelo adapter | `redis://localhost:6379` |
| `NODE_ENV` | Comporta ajustes de log/cache | `development` |

## Fluxo GitFlow
- `main` representa produção; protegido contra pushes diretos.
- `develop` agrega o trabalho aprovado. Crie `feature/<ticket>`, `bugfix/<ticket>`, `release/<versão>` e `hotfix/<issue>` conforme necessidade.
- Fluxo padrão: feature → PR em `develop`; release → branch de estabilização que merge em `main` e retorna para `develop`; hotfix sai de `main` e volta para ambos os ramos.

## Contribuição
1. Abra uma issue descrevendo contexto e impacto esperado.
2. Crie a branch a partir de `develop` e mantenha commits imperativos e pequenos.
3. Garanta `yarn lint && yarn test` verdes antes do PR e atualize docs (`README.md`, `AGENTS.md`) quando mexer em contratos ou deploy.
4. No PR, inclua resumo, comandos executados, logs/screenshots relevantes e checklist de rollout/rollback.

## Monitoramento e Operação
- Cada log leva o hostname para facilitar troubleshooting em múltiplos pods.
- Configure dashboards para métricas críticas: tempo de conexão ao Redis, número de sockets ativos e latência média por evento.
- Em produção, combine com observabilidade (ELK, Loki, CloudWatch) para armazenar os logs gerados pelo `Logger` do Nest.
