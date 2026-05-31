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

## Observações de segurança

- O repositório público já ignora `dist/premium/` via `.gitignore`.
- Não envie `top-cartoes-premium.zip` para o repositório público.
- Mantenha as informações de acesso ao Hotmart separadas.
