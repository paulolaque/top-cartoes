# Distribuição premium para Hotmart

Este repositório público deve expor apenas a versão free no GitHub Pages.
A versão premium deve ficar fora do repositório público e ser distribuída apenas ao cliente Hotmart.

## Fluxo recomendado

1. Mantenha o build premium localmente em `dist/premium/`.
2. Gere um pacote seguro para entrega:

```bash
./scripts/package-premium.sh
```

3. Envie apenas o arquivo `top-cartoes-premium.zip` ou o conteúdo de `dist/premium/` para Hotmart.
4. Nunca publique `dist/premium/` em um repositório público.

## Como criar um repositório privado para o premium

1. Crie um novo repositório privado no GitHub, por exemplo `top-cartoes-premium`.
2. No seu computador, abra uma pasta temporária e copie apenas `dist/premium/`.
3. Inicialize um novo repositório Git ali:

```bash
cd /caminho/para/pasta-temporaria
git init
git branch -M main
cp -r /home/plaque/projects/topcartoes/dist/premium/* .
git add .
git commit -m "Publish premium Hotmart build"
git remote add origin https://github.com/SEU_USUARIO/top-cartoes-premium.git
git push -u origin main
```

4. Use esse repositório privado apenas para o Hotmart.

## Estrutura de acesso premium

- O Hotmart pode ser usado para distribuir o link ou o arquivo premium.
- Se quiser controle de acesso, crie uma área de membros na sua aplicação.
- Este projeto agora tem uma pasta `premium/` com:
  - `premium/index.html` → landing page de acesso premium
  - `premium/login.html` → formulário de código de acesso
  - `premium/app.html` → app premium com acesso liberado após login
  - `premium/auth.js` → lógica de autorização local

## Observações de segurança

- O repositório público já ignora `dist/premium/` via `.gitignore`.
- Não envie `top-cartoes-premium.zip` para o repositório público.
- Mantenha as informações de acesso ao Hotmart separadas.

## Verificação de assinatura via Hotmart

Este projeto agora inclui um backend simples em `premium/hotmart-server.js` que recebe notificações do Hotmart e valida assinaturas:

- `POST /api/hotmart/webhook` — webhook do Hotmart que atualiza o status do assinante
- `GET /api/subscription?email=...` — consulta se o assinante está ativo

### Como usar

1. Execute o servidor com:

```bash
cd /home/plaque/projects/topcartoes/premium
node hotmart-server.js
```

2. Configure o Hotmart para enviar webhooks para:

```
http://SEU-DOMINIO:3000/api/hotmart/webhook
```

3. Defina o segredo de webhook em `HOTMART_WEBHOOK_SECRET`:

```bash
export HOTMART_WEBHOOK_SECRET="seu-segredo"
```

4. Na aula premium do Hotmart, use um link para `premium/login.html`.

5. O login verifica o e-mail no backend e só libera o app se a assinatura estiver ativa.

### Observação

Se o backend não estiver configurado, o login ainda funciona com códigos estáticos em `premium/auth.js`, mas a verificação real de assinatura só ocorrerá quando o servidor estiver disponível.

---

## Deployment e linkagem ao Hotmart

### Opção 1: Estrutura com GitHub Pages (free) + Servidor próprio (premium)

#### 1. Publicar a versão free no GitHub Pages

```bash
cd /home/plaque/projects/topcartoes
git add .
git commit -m "Update free version"
git push origin main
```

A versão free será publicada automaticamente em:
```
https://USUARIO.github.io/topcartoes
```

#### 2. Criar repositório privado para premium no GitHub

```bash
# No painel do GitHub, crie um novo repositório privado chamado "topcartoes-premium"

cd /tmp
mkdir topcartoes-premium-repo
cd topcartoes-premium-repo
git init
git branch -M main

# Copiar apenas os arquivos do premium
cp -r /home/plaque/projects/topcartoes/premium/* .
cp /home/plaque/projects/topcartoes/styles.css .
cp /home/plaque/projects/topcartoes/app.js .
mkdir -p data
cp /home/plaque/projects/topcartoes/data/cards.json ./data/

# Commit
git add .
git commit -m "Initial premium build"
git remote add origin https://github.com/USUARIO/topcartoes-premium.git
git push -u origin main
```

#### 3. Deploy do servidor backend (Hotmart API)

Use um serviço como:
- **Heroku** (simples, tem free tier limitado)
- **Railway** (recomendado, fácil e gratuito)
- **Render** (alternativa)
- **VPS** própria (Digital Ocean, Linode, etc.)

**Exemplo com Railway:**

1. Faça login em [railway.app](https://railway.app)
2. Clique em "New Project" → "Deploy from GitHub"
3. Selecione o repositório `topcartoes-premium`
4. Configure as variáveis de ambiente:
   ```
   HOTMART_WEBHOOK_SECRET=seu-segredo-aleatorio
   PORT=3000
   ```
5. Railway vai gerar um URL tipo `https://topcartoes-premium-1234.railway.app`

#### 4. Configurar a versão premium hospedada

Se quiser que a versão premium seja hospedada em um servidor (e não apenas via download), você pode:

**Opção A:** Usar GitHub Pages com um ramo separado

```bash
cd /tmp/topcartoes-premium-repo
# GitHub Pages já servirá os arquivos em:
# https://USUARIO.github.io/topcartoes-premium
```

**Opção B:** Usar Vercel ou Netlify (mais simples)

1. Conecte o repositório privado `topcartoes-premium` ao Vercel
2. Ele será publicado em: `https://topcartoes-premium.vercel.app`

#### 5. Linkagem no Hotmart

Vá para o painel do Hotmart:

1. **Produto** → **Editar conteúdo**
2. **Adicione um módulo:** "Acesso Premium"
3. **Adicione uma aula:** "Ferrramenta Top Cartões"
4. **Tipo de conteúdo:** Escolha uma das opções:

   **Se usar backend Hotmart API:**
   ```
   Link externo: https://topcartoes-premium.vercel.app/login.html
   ```

   **Se usar apenas download ZIP:**
   ```
   Arquivo: top-cartoes-premium.zip
   (faça upload direto)
   ```

5. **Descrição da aula:**

```
🎉 Bem-vindo ao Top Cartões Premium!

Acesse aqui a sua ferramenta exclusiva:
👉 https://topcartoes-premium.vercel.app/login.html

Instruções:
1. Clique no link acima
2. Insira o e-mail da sua compra
3. O sistema verificará sua assinatura automaticamente
4. Acesso liberado! 🚀

Se tiver problemas, verifique:
- Usa o mesmo e-mail da compra no Hotmart
- Aguarde alguns minutos após a compra (webhook leva pouco tempo)
- Limpe o cache do navegador (Ctrl+Shift+Del)
```

#### 6. Configurar o webhook Hotmart

1. No painel do Hotmart → Configurações → Webhooks
2. Adicione um novo webhook:
   - **URL:** `https://topcartoes-premium-1234.railway.app/api/hotmart/webhook`
   - **Eventos:** Marque "Compra aprovada", "Assinatura ativada", "Assinatura cancelada"
   - **Secret:** Copie o valor de `HOTMART_WEBHOOK_SECRET` (deve ser o mesmo configurado no servidor)

3. Salve e teste o webhook

#### 7. Fluxo final de compra

```
Cliente compra no Hotmart
    ↓
Hotmart valida pagamento
    ↓
Hotmart envia webhook para seu servidor
    ↓
Seu servidor (`hotmart-server.js`) grava que o cliente está ativo
    ↓
Cliente recebe link no Hotmart Club
    ↓
Cliente clica em: https://topcartoes-premium.vercel.app/login.html
    ↓
Sistema pede e-mail de compra
    ↓
Sistema consulta: `/api/subscription?email=...` no seu servidor
    ↓
Se ativo, libera acesso a: https://topcartoes-premium.vercel.app/app.html
    ↓
Cliente usa a ferramenta premium! 🎉
```

---

### Opção 2: Estrutura simplificada (sem backend)

Se não quiser configurar um servidor backend:

1. Mantenha os **códigos de acesso estáticos** em `premium/auth.js`
2. Use `top-cartoes-premium.zip` como arquivo de download no Hotmart
3. Ou hospede a versão premium privada apenas via link compartilhado

---

### Checklist de deployment

- [ ] Repositório `topcartoes` público no GitHub com free version
- [ ] Repositório `topcartoes-premium` privado no GitHub
- [ ] Free version publicada em GitHub Pages
- [ ] Premium version hospedada (Vercel, Railway, etc.)
- [ ] Servidor backend rodando e configurado (se usar webhook)
- [ ] Variáveis de ambiente setadas (`HOTMART_WEBHOOK_SECRET`)
- [ ] Webhook do Hotmart registrado e testado
- [ ] Links da aula Hotmart atualizados
- [ ] Teste de compra (usar e-mail de teste do Hotmart)
