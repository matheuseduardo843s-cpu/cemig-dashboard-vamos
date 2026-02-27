// api/planilha.js
// Vercel Serverless Function — baixa o .xlsx via link público do OneDrive

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const shareUrl = process.env.ONEDRIVE_URL;
    if (!shareUrl) throw new Error('ONEDRIVE_URL não configurada');

    // Converte link de compartilhamento do OneDrive para link de download direto
    // Ex: https://1drv.ms/x/s!ABC... → download direto
    let downloadUrl = shareUrl;

    // Se for link curto 1drv.ms, converte para download direto
    if (shareUrl.includes('1drv.ms') || shareUrl.includes('sharepoint.com') || shareUrl.includes('onedrive.live.com')) {
      // Adiciona download=1 para forçar download do arquivo
      const url = new URL(shareUrl);
      url.searchParams.set('download', '1');
      downloadUrl = url.toString();
    }

    const fileRes = await fetch(downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow'
    });

    if (!fileRes.ok) throw new Error(`Erro ao buscar arquivo: HTTP ${fileRes.status}`);

    const buffer = await fileRes.arrayBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // cache 5 min
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('Erro /api/planilha:', err);
    res.status(500).json({ error: err.message });
  }
}
