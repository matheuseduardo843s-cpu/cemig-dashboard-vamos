// api/salvar.js
import { Redis } from '@upstash/redis';
import * as XLSX from 'xlsx';

export const config = { api: { bodyParser: false } };

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false, cellFormula: true, cellNF: false });
    const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('resumo')) || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    // Lê célula BA3 diretamente
    const cellBA3 = ws['BA3'];
    let totalMedidoBA3 = null;
    if (cellBA3) {
      if (typeof cellBA3.v === 'number' && cellBA3.v > 0) {
        totalMedidoBA3 = cellBA3.v;
      } else if (cellBA3.w) {
        const p = parseFloat(String(cellBA3.w).replace(/[^0-9,.-]/g, '').replace(',', '.'));
        if (!isNaN(p) && p > 0) totalMedidoBA3 = p;
      }
    }

    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
    let headerRowIdx = 2;
    for (let i = 0; i < Math.min(10, raw.length); i++) {
      if ((raw[i] || []).some(v => v != null && String(v).trim() === 'OS')) {
        headerRowIdx = i; break;
      }
    }

    const headers = (raw[headerRowIdx] || []).map(h => h == null ? '' : String(h).trim());
    const rows = [];
    for (let i = headerRowIdx + 1; i < raw.length; i++) {
      const arr = raw[i] || [];
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = arr[idx] !== undefined ? arr[idx] : null; });
      const osVal = obj['OS'];
      if (osVal == null) continue;
      const osStr = String(osVal).trim();
      if (osStr === '' || osStr === '0' || osStr === 'null') continue;
      rows.push(obj);
    }

    const payload = {
      rows,
      totalMedidoBA3,   // ← nome correto agora
      updatedAt: new Date().toISOString(),
      filename: req.headers['x-filename'] || 'planilha.xlsx'
    };

    await redis.set('dashboard_data', JSON.stringify(payload), { ex: 60 * 60 * 24 * 30 });

    res.status(200).json({ ok: true, rows: rows.length, totalMedidoBA3, updatedAt: payload.updatedAt });

  } catch (err) {
    console.error('Erro /api/salvar:', err);
    res.status(500).json({ error: err.message });
  }
}
