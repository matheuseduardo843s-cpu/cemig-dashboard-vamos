// api/carregar.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = await kv.get('cemig:dashboard');

    if (!data) {
      return res.status(404).json({ error: 'Nenhum dado salvo' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);

  } catch (err) {
    console.error('[carregar]', err);
    return res.status(500).json({ error: err.message });
  }
}
