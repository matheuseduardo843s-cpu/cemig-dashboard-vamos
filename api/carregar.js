// api/carregar.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join('/tmp', 'planilha_data.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }
    
    // Lê os dados salvos
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsedData = JSON.parse(data);
    
    // Retorna os dados (apenas rows, filename e updatedAt)
    res.status(200).json({
      rows: parsedData.rows || [],
      filename: parsedData.filename || 'planilha.xlsx',
      updatedAt: parsedData.updatedAt
    });
    
  } catch (error) {
    console.error('Erro ao carregar:', error);
    res.status(500).json({ error: 'Erro ao carregar dados: ' + error.message });
  }
}
