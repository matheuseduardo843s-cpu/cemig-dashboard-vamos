// api/salvar.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = req.body;
    
    // Valida os dados
    if (!data.rows || !Array.isArray(data.rows)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    
    // Salva no KV Store
    const saveData = {
      rows: data.rows,
      filename: data.filename,
      totalMedido: data.totalMedido,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set('dashboard_cemig_data', JSON.stringify(saveData));
    
    console.log(`✅ Dados salvos no KV: ${data.rows.length} linhas, totalMedido: ${data.totalMedido}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Dados salvos com sucesso',
      rowsCount: data.rows.length,
      totalMedido: data.totalMedido
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo: ' + error.message });
  }
}
