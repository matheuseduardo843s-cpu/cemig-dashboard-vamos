// api/carregar.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join('/tmp', 'planilha_data.json');

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
    // Verifica se o arquivo existe
    if (!fs.existsSync(DATA_FILE)) {
      console.log('Nenhum dado encontrado');
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }
    
    // Lê os dados
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsedData = JSON.parse(data);
    
    // Valida os dados
    if (!parsedData.rows || !Array.isArray(parsedData.rows)) {
      return res.status(404).json({ error: 'Dados corrompidos' });
    }
    
    console.log(`Dados carregados: ${parsedData.rows.length} linhas, totalMedido: ${parsedData.totalMedido}`);
    
    // Retorna os dados
    res.status(200).json({
      rows: parsedData.rows,
      filename: parsedData.filename || 'planilha.xlsx',
      totalMedido: parsedData.totalMedido || null,
      updatedAt: parsedData.updatedAt
    });
    
  } catch (error) {
    console.error('Erro ao carregar:', error);
    res.status(500).json({ error: 'Erro ao carregar dados: ' + error.message });
  }
}
