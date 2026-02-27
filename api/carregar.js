// api/carregar.js
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const raw = await redis.get('dashboard_data');
    if (!raw) {
      res.status(404).json({ error: 'Nenhum dado salvo ainda' });
      return;
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).json(data);
  } catch (err) {
    console.error('Erro /api/carregar:', err);
    res.status(500).json({ error: err.message });
  }
}
