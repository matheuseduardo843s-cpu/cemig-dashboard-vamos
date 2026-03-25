// api/salvar.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join('/tmp', 'planilha_data.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = req.body;
    
    // Salva os dados completos (rows, filename, totalMedido, updatedAt)
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    
    res.status(200).json({ 
      success: true, 
      message: 'Dados salvos com sucesso',
      rowsCount: data.rows?.length || 0 
    });
    
  } catch (error) {
    console.error('Erro ao salvar:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo: ' + error.message });
  }
}
