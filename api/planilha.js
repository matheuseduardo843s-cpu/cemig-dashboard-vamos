// api/planilha.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const shareUrl = process.env.ONEDRIVE_URL || process.env.URL_ONEDRIVE;
    if (!shareUrl) throw new Error('ONEDRIVE_URL não configurada');

    // Converte link SharePoint para download direto
    // https://empresa-my.sharepoint.com/:x:/g/personal/user/FILE?e=xxx
    // → adiciona download=1
    let downloadUrl = shareUrl;
    
    if (shareUrl.includes('sharepoint.com') || shareUrl.includes('1drv.ms') || shareUrl.includes('onedrive.live.com')) {
      try {
        const url = new URL(shareUrl);
        url.searchParams.set('download', '1');
        downloadUrl = url.toString();
      } catch(e) {
        downloadUrl = shareUrl + (shareUrl.includes('?') ? '&' : '?') + 'download=1';
      }
    }

    console.log('Buscando:', downloadUrl.substring(0, 80) + '...');

    const fileRes = await fetch(downloadUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*'
      },
      redirect: 'follow'
    });

    console.log('Status:', fileRes.status, 'Content-Type:', fileRes.headers.get('content-type'));

    if (!fileRes.ok) {
      const text = await fileRes.text();
      throw new Error(`HTTP ${fileRes.status}: ${text.substring(0,200)}`);
    }

    const contentType = fileRes.headers.get('content-type') || '';
    if (contentType.includes('html')) {
      const text = await fileRes.text();
      throw new Error(`Recebeu HTML em vez do arquivo. Link pode não estar público. Preview: ${text.substring(0,200)}`);
    }

    const buffer = await fileRes.arrayBuffer();
    console.log('Arquivo recebido:', buffer.byteLength, 'bytes');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('Erro /api/planilha:', err.message);
    res.status(500).json({ error: err.message });
  }
}
