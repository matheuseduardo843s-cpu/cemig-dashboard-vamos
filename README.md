# 🚀 Dashboard CEMIG — Deploy no Vercel com OneDrive (link público)

## O que você vai ter no final
- Link tipo `https://cemig-avalicon.vercel.app`
- Abre no navegador → carrega direto do OneDrive → dashboard completo
- Atualiza a planilha no OneDrive → na próxima abertura já reflete

**Sem Azure. Sem cartão. 100% gratuito.**

---

## PARTE 1 — Gerar link público da planilha no OneDrive (2 min)

1. Abra o **OneDrive** no navegador
2. Clique com botão direito na planilha `CONTROLE_CEMIG_-_24-25.xlsx`
3. Clique em **"Compartilhar"**
4. Em "Quem pode acessar", selecione **"Qualquer pessoa com o link"**
5. Certifique-se que está como **"Pode visualizar"** (não editar)
6. Clique em **"Copiar link"**
7. **Guarde esse link** — você vai precisar no Passo 3

O link vai ser parecido com:
```
https://1drv.ms/x/s!AbCdEfGhIjKl...
```

---

## PARTE 2 — Deploy no Vercel (5 min)

### 2.1 Criar conta no Vercel
1. Acesse **https://vercel.com**
2. Clique em **"Sign Up"** → **"Continue with GitHub"**
   - Se não tiver GitHub: crie conta grátis em github.com primeiro (é rápido)

### 2.2 Fazer o deploy
1. Acesse **https://vercel.com/new**
2. Clique em **"Browse"** e selecione a pasta `cemig-dashboard` (este ZIP descompactado)
3. Clique em **"Deploy"**
4. Aguarde ~1 minuto — vai aparecer uma URL como `cemig-dashboard.vercel.app`

---

## PARTE 3 — Configurar o link do OneDrive (2 min)

1. No Vercel, vá em **Settings → Environment Variables**
2. Adicione esta variável:

| Nome           | Valor                                              |
|----------------|----------------------------------------------------|
| `ONEDRIVE_URL` | O link copiado no Passo 1 (ex: https://1drv.ms/...) |

3. Clique em **Save**
4. Vá em **Deployments → clique nos 3 pontinhos → Redeploy**

---

## PARTE 4 — Testar

1. Acesse a URL gerada (ex: `https://cemig-avalicon.vercel.app`)
2. O dashboard deve carregar em ~5 segundos
3. ✅ Pronto!

---

## Como atualizar os dados

Salve a planilha normalmente no OneDrive.
Na próxima abertura do link, os dados já estarão atualizados.

Para forçar atualização sem fechar o navegador: clique em **"🔄 Atualizar dados"** na toolbar.

---

## Estrutura do projeto
```
cemig-dashboard/
├── index.html        ← O dashboard completo
├── api/
│   └── planilha.js   ← Busca o .xlsx via link do OneDrive
├── vercel.json       ← Configuração do Vercel
└── README.md         ← Este arquivo
```

---

## Dúvidas comuns

**Dashboard carrega mas não mostra dados**
→ Verifique se o link do OneDrive está como "Qualquer pessoa com o link"

**Erro "ONEDRIVE_URL não configurada"**
→ A variável de ambiente não foi salva. Repita o Passo 3.

**Erro HTTP 403**
→ O link do OneDrive expirou ou foi revogado. Gere um novo link e atualize a variável.

**Quer personalizar a URL** (ex: `meusite.vercel.app`)
→ No Vercel: Settings → Domains → edite o subdomínio gratuitamente
