// api/carregar.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Busca dados do KV Store
    const savedData = await kv.get('dashboard_cemig_data');
    
    if (!savedData) {
      console.log('📭 Nenhum dado encontrado no KV');
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }
    
    const parsedData = JSON.parse(savedData);
    
    // Valida os dados
    if (!parsedData.rows || !Array.isArray(parsedData.rows)) {
      return res.status(404).json({ error: 'Dados corrompidos' });
    }
    
    console.log(`📥 Dados carregados do KV: ${parsedData.rows.length} linhas, totalMedido: ${parsedData.totalMedido}`);
    
    // Retorna os dados
    res.status(200).json({
      rows: parsedData.rows,
      filename: parsedData.filename || 'planilha.xlsx',
      totalMedido: parsedData.totalMedido || null,
      updatedAt: parsedData.updatedAt
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar:', error);
    res.status(500).json({ error: 'Erro ao carregar dados: ' + error.message });
  }
}
