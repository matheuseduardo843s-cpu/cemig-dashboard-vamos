// api/carregar.js
import { getKv, explicaErro } from './_kv.js';

const CONTRATOS = ['2324', '2425'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const contrato = String(req.query?.contrato || '2425');
    if (!CONTRATOS.includes(contrato)) {
      return res.status(400).json({ error: 'Contrato inválido' });
    }

    let data = await getKv().get(`cemig:dashboard:${contrato}`);
    // Compatibilidade: dados antigos (chave única) pertencem ao contrato novo
    if (!data && contrato === '2425') data = await getKv().get('cemig:dashboard');

    if (!data) {
      return res.status(404).json({ error: 'Nenhum dado salvo' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);

  } catch (err) {
    console.error('[carregar]', err);
    return res.status(500).json({ error: explicaErro(err) });
  }
}
