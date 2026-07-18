#!/bin/bash

# Script simplificado para sincronizar premium
# Sem interação interativa

REPO_URL="git@github.com:paulolaque/top-cartoes-premium.git"
TEMP_DIR="/tmp/topcartoes-premium-sync"
PREMIUM_SOURCE="/home/plaque/projects/topcartoes"

# Remover diretório anterior se existir
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

cd "$TEMP_DIR"

# Clone não-interativo
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no" git clone "$REPO_URL" . || {
    echo "❌ Erro ao clonar repositório"
    exit 1
}

echo "✓ Repositório clonado"

# Sincronizar arquivos premium
echo "📋 Copiando arquivos..."

mkdir -p premium data
cp -r "$PREMIUM_SOURCE/premium/"* premium/ 2>/dev/null || true
cp "$PREMIUM_SOURCE/data/cards.json" data/
cp "$PREMIUM_SOURCE/styles.css" .
cp "$PREMIUM_SOURCE/app.js" .

# Criar .gitignore
cat > .gitignore << 'EOF'
node_modules/
subscribers.json
.env
.DS_Store
*.log
dist/
build/
EOF

# Criar README
cat > README.md << 'EOF'
# Top Cartões Premium

Versão premium do simulador de lucro por cartão.

## Links de Acesso

- **Login:** `/premium/login.html`
- **App:** `/premium/app.html`

## Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel
```

### Backend Node.js
```bash
export HOTMART_WEBHOOK_SECRET="seu-segredo"
node premium/hotmart-server.js
```

## Webhook Hotmart

- **URL:** `https://seu-dominio.com/api/hotmart/webhook`
- **Secret:** `HOTMART_WEBHOOK_SECRET`
EOF

# Criar package.json
cat > package.json << 'EOF'
{
  "name": "topcartoes-premium",
  "version": "1.0.0",
  "description": "Top Cartões Premium",
  "scripts": {
    "server": "node premium/hotmart-server.js"
  }
}
EOF

# Commit
git add .
git commit -m "Sync premium files" --allow-empty

# Push
git push -u origin main

echo "✅ Sincronização concluída!"
echo ""
echo "📁 Repositório: $TEMP_DIR"
echo "🔗 GitHub: https://github.com/paulolaque/topcartoes-premium"
