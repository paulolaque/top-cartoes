#!/bin/bash

# Script para sincronizar arquivos premium para o repositório privado
# Uso: ./sync-premium.sh

set -e

REPO_URL="git@github.com:paulolaque/top-cartoes-premium.git"
TEMP_DIR="/tmp/topcartoes-premium-sync-$$"
PREMIUM_SOURCE="/home/plaque/projects/topcartoes"

echo "📦 Sincronizando arquivos premium para repositório privado..."

# Criar diretório temporário
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clone do repositório privado se já existe
if [ -d "$TEMP_DIR/.git" ]; then
    echo "✓ Repositório já clonado"
else
    echo "📥 Clonando repositório privado..."
    git clone "$REPO_URL" .
fi

# Sincronizar arquivos premium
echo "📋 Copiando arquivos..."

# Copiar estrutura premium
mkdir -p premium data
cp -r "$PREMIUM_SOURCE/premium/"* premium/ 2>/dev/null || true
cp -r "$PREMIUM_SOURCE/data/cards.json" data/

# Copiar recursos compartilhados
cp "$PREMIUM_SOURCE/styles.css" .
cp "$PREMIUM_SOURCE/app.js" .

# Criar .gitignore para o repositório premium
cat > .gitignore << 'EOF'
node_modules/
subscribers.json
.env
.DS_Store
*.log
dist/
build/
EOF

# Criar README.md para documentação
cat > README.md << 'EOF'
# Top Cartões Premium

Versão premium do simulador de lucro por cartão.

## Estrutura

- `premium/` → Páginas e lógica de acesso premium
  - `index.html` → Landing page
  - `login.html` → Formulário de login
  - `app.html` → Aplicativo premium
  - `auth.js` → Lógica de autenticação
  - `hotmart-server.js` → Backend Hotmart (opcional)
  - `subscribers.json` → Banco de dados de assinantes

- `styles.css` → Estilos compartilhados
- `app.js` → Lógica da aplicação
- `data/` → Base de dados de cartões

## Deploy

### Opção 1: Vercel (recomendado)

1. Conecte este repositório ao Vercel
2. Configure as variáveis de ambiente se necessário
3. Deploy automático em cada push

```bash
npm i -g vercel
vercel
```

### Opção 2: Backend Hotmart (Node.js)

Para rodar o servidor de webhooks Hotmart:

```bash
cd premium
export HOTMART_WEBHOOK_SECRET="seu-segredo"
node hotmart-server.js
```

Servidor rodará em `http://localhost:3000`

Endpoints:
- `POST /api/hotmart/webhook` → Recebe notificações do Hotmart
- `GET /api/subscription?email=...` → Verifica se assinante está ativo

## Login

Acesso em: `login.html`

Se backend Hotmart estiver configurado:
- Insira o e-mail da compra
- Sistema verifica assinatura automaticamente

Se usar offline:
- Códigos permitidos em `premium/auth.js`
EOF

# Criar package.json para facilitar deploy
cat > package.json << 'EOF'
{
  "name": "topcartoes-premium",
  "version": "1.0.0",
  "description": "Top Cartões - Versão Premium",
  "main": "premium/hotmart-server.js",
  "scripts": {
    "server": "node premium/hotmart-server.js",
    "dev": "node premium/hotmart-server.js"
  },
  "author": "paulolaque",
  "license": "ISC"
}
EOF

# Criar vercel.json para configuração de deploy
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm install",
  "installCommand": "npm install",
  "outputDirectory": "./",
  "env": {
    "HOTMART_WEBHOOK_SECRET": "@hotmart-webhook-secret"
  }
}
EOF

# Git commit e push
echo "🔄 Fazendo commit..."
git add .
git commit -m "Sync premium files from main repository" --allow-empty

echo "📤 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ Sincronização completa!"
echo ""
echo "Próximos passos:"
echo "1. Acesse: https://github.com/paulolaque/topcartoes-premium"
echo "2. Conecte ao Vercel: https://vercel.com/new"
echo "3. Selecione o repositório 'topcartoes-premium'"
echo "4. Deploy será automático!"
echo ""
echo "Para testar localmente:"
echo "  cd $TEMP_DIR && python3 -m http.server 8000"
echo ""

# Cleanup
# Descomente se quiser remover o diretório temporário
# rm -rf "$TEMP_DIR"

echo "📁 Arquivos em: $TEMP_DIR"
