# ONIXPLUS — Comandos de teste

Uroteiro para confirmar que o sistema continua funcionando antes de iniciar uma nova fase. Execute os comandos no PowerShell, a partir da raiz do repositório.

## 1. Preparar o ambiente

Confirme as versões instaladas:

```powershell
node --version
corepack pnpm --version
```

O projeto aceita Node `^22.13.0` ou `>=24.0.0` e fixa pnpm `10.33.0`. Se `pnpm --version` não mostrar `10.33.0`, use `corepack pnpm` no lugar de `pnpm` em todos os comandos deste documento. O pnpm global 11 pode ignorar patches do projeto e tentar recriar `node_modules`.

Em uma instalação nova ou após alterar dependências, execute:

```powershell
corepack prepare pnpm@10.33.0 --activate
corepack pnpm install --frozen-lockfile
corepack pnpm nx show projects
```

`corepack enable` é opcional. Em uma instalação protegida do Node no Windows, ele pode falhar com `EPERM` ao tentar escrever em `C:\Program Files\nodejs`; isso não impede o uso direto de `corepack pnpm` e não é necessário executar o terminal como administrador apenas para iniciar o projeto.

No Windows, a instalação de dependências nativas pode exigir Visual Studio Build Tools com a carga **Desktop development with C++**. Prefira um caminho local curto e sem espaços, fora do OneDrive.

## 2. Verificação rápida antes de desenvolver

Este é o conjunto mínimo recomendado antes de prosseguir:

```powershell
pnpm run deps:nx:validate
pnpm run deps:vite:test
pnpm run styles:inputs:validate
pnpm run typecheck:ci
pnpm run i18n:check
pnpm run lint
pnpm run test:frontend
pnpm run test:backend
```

Todos os comandos devem terminar com código de saída `0`.

## 3. Executar o aplicativo manualmente

Aplicativo desktop Electron:

```powershell
pnpm run serve:backend
```

Se o Electron falhar ao carregar `better-sqlite3`, instale o Visual Studio Build Tools com **Desktop development with C++** e reinstale as dependências em um caminho curto, sem espaços e fora do OneDrive. Para apenas visualizar a interface sem os recursos nativos do desktop, use o frontend web abaixo.

Frontend web:

Abra dois terminais. No primeiro, inicie o backend na porta esperada pelo frontend de desenvolvimento:

```powershell
$env:PORT='3000'
$env:CLIENT_URL='http://localhost:4200'
$env:IPTVNATOR_PROXY_ALLOW_PRIVATE_NETWORKS='1'
$env:TSX_TSCONFIG_PATH='tsconfig.base.json'
corepack pnpm exec tsx apps/web-backend/src/main.ts
```

No segundo terminal, inicie a interface:

```powershell
corepack pnpm run serve:frontend
```

A interface abre em `http://localhost:4200` e o backend deve responder em `http://localhost:3000/health`. Sem o backend, a tela funciona, mas importações M3U por URL, Xtream e Stalker podem falhar. O alvo `web-backend:serve` usa a porta 3333 para os testes E2E e não corresponde ao `BACKEND_URL` 3000 do frontend manual.

PWA:

```powershell
corepack pnpm run serve:frontend:pwa
```

Durante o teste manual, verifique pelo menos:

1. Abertura do aplicativo sem erro no terminal.
2. Importação de uma playlist M3U de teste, sem credenciais reais.
3. Navegação entre grupos e canais.
4. Reprodução e encerramento de um stream autorizado para teste.
5. Volume, mute, tela cheia e troca de canal.
6. Favoritos, histórico e posição de reprodução.
7. EPG, quando a playlist de teste possuir XMLTV.
8. Fechamento e nova abertura do aplicativo, confirmando persistência.

Nunca publique capturas, logs ou fixtures que contenham credenciais, URLs privadas ou conteúdo de uma conta real.

## 4. Testes unitários completos

```powershell
pnpm run test:unit:ci
```

Para testar um projeto isoladamente:

```powershell
pnpm nx test <nome-do-projeto>
```

Exemplos:

```powershell
pnpm nx test web
pnpm nx test electron-backend
pnpm nx test m3u-state
```

Consulte os projetos que oferecem testes com:

```powershell
pnpm nx show projects --withTarget test
```

## 5. Builds de validação

```powershell
pnpm run build:frontend
pnpm run build:frontend:pwa
pnpm run build:backend
```

Para validar o pacote desktop:

```powershell
pnpm run package:app
pnpm run verify:package-layout
pnpm run smoke:packaged
```

O empacotamento pode exigir ferramentas nativas adicionais e deve ser executado depois que lint, tipos e testes unitários estiverem aprovados.

## 6. Testes E2E

Liste os projetos disponíveis:

```powershell
pnpm nx show projects --withTarget e2e
```

Execute os fluxos web e Electron:

```powershell
pnpm nx run web-e2e:e2e
pnpm nx run electron-backend-e2e:e2e
```

Quando apenas um fluxo foi alterado, prefira o alvo atomizado correspondente. Exemplos existentes:

```powershell
pnpm nx run web-e2e:e2e-ci--src/xtream.e2e.ts
pnpm nx run electron-backend-e2e:e2e-ci--src/search.e2e.ts
```

## 7. Validação completa antes de uma fase ou entrega

Execute em ordem e interrompa ao primeiro erro:

```powershell
pnpm run deps:nx:validate
pnpm run deps:vite:test
pnpm run styles:inputs:validate
pnpm run skills:validate
pnpm run release:notes:validate
pnpm run typecheck:ci
pnpm run i18n:check
pnpm run lint
pnpm run test:unit:ci
pnpm run build:frontend
pnpm run build:frontend:pwa
pnpm run build:backend
pnpm nx run web-e2e:e2e
pnpm nx run electron-backend-e2e:e2e
```

## 8. Limpar somente o estado do Nx

Se o grafo ou cache local do Nx apresentar comportamento inconsistente:

```powershell
pnpm nx reset
pnpm nx show projects
```

Esse comando limpa o estado do Nx; ele não substitui a investigação de uma falha real de teste.

## 9. Registro recomendado

Antes de prosseguir, registre:

- commit testado (`git rev-parse HEAD`);
- versões de Node e pnpm;
- comandos executados;
- resultado aprovado ou falha;
- primeiro erro relevante e arquivo de log, se houver;
- itens manuais verificados.

Não avance para mudanças funcionais enquanto a linha de base apresentar falhas não explicadas.
