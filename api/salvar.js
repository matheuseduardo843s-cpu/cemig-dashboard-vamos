// api/salvar.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join('/tmp', 'planilha_data.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const buffer = req.body;
    const filename = req.headers['x-filename'] || 'planilha.xlsx';
    
    // Salva o arquivo original
    const filePath = path.join('/tmp', filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    // Extrai as linhas da planilha (igual ao frontend faz)
    const XLSX = require('xlsx');
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false, cellFormula: true });
    const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('resumo')) || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
    
    // Encontra linha de cabeçalho
    let headerRowIdx = 2;
    for (let i = 0; i < Math.min(10, raw.length); i++) {
      if ((raw[i] || []).some(v => v != null && String(v).trim() === 'OS')) {
        headerRowIdx = i;
        break;
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
    
    // Salva os dados processados (SOMENTE rows e filename)
    const dataToSave = {
      rows: rows,
      filename: filename,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave));
    
    res.status(200).json({ 
      success: true, 
      message: 'Arquivo salvo com sucesso',
      rowsCount: rows.length 
    });
    
  } catch (error) {
    console.error('Erro ao salvar:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo: ' + error.message });
  }
}
