// api/salvar.js
import { kv } from '@vercel/kv';
import * as XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
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
    const buffer   = await getRawBody(req);
    const filename = req.headers['x-filename'] || 'planilha.xlsx';

    const wb = XLSX.read(buffer, {
      type:        'buffer',
      cellDates:   false,
      cellFormula: true,
      cellNF:      false,
    });

    // Localiza aba Resumo
    const sheetName = wb.SheetNames.find(n =>
      n.toLowerCase().includes('resumo')
    ) || wb.SheetNames[0];

    const ws = wb.Sheets[sheetName];

    // ── TOTAL MEDIDO: EXCLUSIVAMENTE BB3 ──
    let totalMedidoBB3 = 0;
    const cellBB3 = ws['BB3'];
    if (cellBB3 && typeof cellBB3.v === 'number') {
      totalMedidoBB3 = cellBB3.v;
    }

    // Extrai linhas
    const raw = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: null,
      raw:    true,
    });

    // Procura linha de cabeçalho com 'OS'
    let headerRowIdx = 2;
    for (let i = 0; i < Math.min(10, raw.length); i++) {
      if ((raw[i] || []).some(v =>
        v != null && (String(v).trim() === 'OS' || String(v).trim() === 'OS ')
      )) {
        headerRowIdx = i;
        break;
      }
    }

    const headers = (raw[headerRowIdx] || []).map(h =>
      h == null ? '' : String(h).trim()
    );

    const rows = [];
    for (let i = headerRowIdx + 1; i < raw.length; i++) {
      const arr = raw[i] || [];
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = arr[idx] !== undefined ? arr[idx] : null;
      });
      const osVal = obj['OS'];
      if (osVal == null) continue;
      const osStr = String(osVal).trim();
      if (osStr === '' || osStr === '0' || osStr === 'null') continue;
      rows.push(obj);
    }

    // Salva no KV com totalMedidoBB3
    const payload = {
      filename,
      totalMedidoBB3,
      rows,
      updatedAt: new Date().toISOString(),
    };

    await kv.set('cemig:dashboard', payload, { ex: 60 * 60 * 24 * 30 });

    return res.status(200).json({ ok: true, rows: rows.length, totalMedidoBB3 });

  } catch (err) {
    console.error('[salvar]', err);
    return res.status(500).json({ error: err.message });
  }
}
