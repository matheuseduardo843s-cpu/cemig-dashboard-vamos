// api/_kv.js — cliente do banco (Vercel KV / Upstash Redis) com mensagens de erro claras
import { createClient } from '@vercel/kv';

export function getKv() {
  const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Banco de dados não configurado: conecte um Upstash Redis (ou Vercel KV) ao projeto em Storage no painel do Vercel e faça um novo deploy.');
  }
  return createClient({ url, token });
}

// Traduz falhas de rede/autenticação do banco em mensagens úteis
export function explicaErro(err) {
  const causa = err?.cause?.code || err?.cause?.message || '';
  const msg = String(err?.message || err);
  if (/fetch failed/i.test(msg) || /ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(causa)) {
    return 'Não foi possível acessar o banco de dados (' + (causa || msg) + '). Verifique em Storage no Vercel se o banco existe, está ativo e conectado a este projeto; se foi recriado, faça um novo deploy.';
  }
  if (/WRONGPASS|NOAUTH|Unauthorized|401/i.test(msg)) {
    return 'Banco de dados recusou o acesso (token inválido). Reconecte o banco ao projeto no Vercel e faça um novo deploy.';
  }
  return msg;
}
