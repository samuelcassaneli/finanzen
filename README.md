# Personal-Finance-OS

Sua vida financeira em um só lugar. Stack: **Next.js 14** (App Router) + **Supabase** (Postgres + RLS + Auth) + **Belvo** (Open Finance LATAM), pronto para deploy na **Vercel**.

## Setup

```bash
npm install
cp .env.example .env.local
# preencha as variáveis (ver abaixo)
npm run dev
```

### Variáveis de ambiente

| Variável | Onde obter |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | mesma página (publishable / anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | mesma página (**server-only**, nunca exponha no client) |
| `BELVO_SECRET_ID` / `BELVO_SECRET_PASSWORD` | Belvo Dashboard → API keys |
| `BELVO_ENV` | `sandbox` \| `development` \| `production` |
| `BELVO_WEBHOOK_SECRET` | (opcional) configurado no webhook da Belvo |
| `NEXT_PUBLIC_SITE_URL` | URL pública do app (callback do widget) |

### Aplicar o schema

1. Supabase Dashboard → SQL Editor.
2. Cole `supabase/migrations/0001_init.sql` e execute.
3. Tabelas criadas: `profiles`, `categories`, `financial_links`, `transactions` — todas com **RLS** e policies por `auth.uid()`. Trigger em `auth.users` cria a `profiles` automaticamente no signup.

## Estrutura

```
app/
  api/belvo/
    widget-token/route.ts    # gera access token p/ Connect Widget
    sync/route.ts            # puxa transações de um link e faz upsert
    webhook/route.ts         # recebe TRANSACTIONS_* da Belvo (HMAC)
  auth/signout/route.ts
  dashboard/                 # server component + ConnectButton client
  login/                     # email + senha
lib/
  belvo.ts                   # wrapper REST (sem SDK; edge-friendly)
  sync.ts                    # syncLink() compartilhado route + webhook
  supabase/{client,server,middleware,types}.ts
  utils.ts
supabase/migrations/0001_init.sql
middleware.ts                # refresh de sessão + guard de rotas
```

## Deploy (Vercel)

1. Importe o repo na Vercel.
2. Configure as env vars acima em **Production** e **Preview**.
3. Após o deploy, no Belvo Dashboard cadastre o webhook:
   - URL: `https://<seu-domínio>/api/belvo/webhook`
   - Eventos: `TRANSACTIONS_CREATED`, `TRANSACTIONS_UPDATED`
   - Salve o secret e adicione como `BELVO_WEBHOOK_SECRET`.

## Notas de segurança

- `SUPABASE_SERVICE_ROLE_KEY` só é usada em `app/api/belvo/webhook/route.ts` (sem sessão de usuário). Todas as outras leituras/escritas passam pelo cliente SSR com RLS aplicada.
- O webhook valida assinatura HMAC SHA256 (`t=...,v1=...`). Se `BELVO_WEBHOOK_SECRET` não estiver setado, a verificação é pulada com warning — **defina em produção**.
- Upsert de transações usa `belvo_transaction_id` como chave única → re-syncs são idempotentes.
