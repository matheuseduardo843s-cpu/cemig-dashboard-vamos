// api/salvar.js
import { getKv, explicaErro } from './_kv.js';

const CONTRATOS = ['2324', '2425'];

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end',  ()    => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const contrato = String(req.query?.contrato || '2425');
    if (!CONTRATOS.includes(contrato)) {
      return res.status(400).json({ error: 'Contrato inválido' });
    }

    // O navegador já lê a planilha e envia só as colunas usadas (JSON enxuto)
    const body = JSON.parse((await getRawBody(req)).toString('utf8'));
    const rows = Array.isArray(body.rows) ? body.rows : null;
    if (!rows) return res.status(400).json({ error: 'Dados inválidos' });

    const payload = {
      contrato,
      filename:       String(body.filename || 'planilha.xlsx'),
      totalMedidoBB3: Number(body.totalMedidoBB3) || 0,
      rows,
      updatedAt:      new Date().toISOString(),
    };

    // Sem expiração: o relatório fica salvo até a próxima planilha ser enviada
    await getKv().set(`cemig:dashboard:${contrato}`, payload);

    return res.status(200).json({ ok: true, rows: rows.length, totalMedidoBB3: payload.totalMedidoBB3 });

  } catch (err) {
    console.error('[salvar]', err);
    return res.status(500).json({ error: explicaErro(err) });
  }
}
