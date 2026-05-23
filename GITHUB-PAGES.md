# Publicar no GitHub Pages

Esta pasta publica apenas a versao gratis e sanitizada:

- `dist/free`

Ela nao contem nomes completos nem colunas premium.

## Caminho mais simples

1. Crie um repositorio novo no GitHub, por exemplo `top-cartoes-free`.
2. Abra PowerShell dentro de `C:\Users\paulo\OneDrive\Documents\New project\dist\free`.
3. Rode:

```powershell
git init
git branch -M main
git add .
git commit -m "Publish free version"
git remote add origin https://github.com/SEU_USUARIO/top-cartoes-free.git
git push -u origin main
```

4. No GitHub, abra:

`Settings > Pages`

5. Em `Build and deployment` escolha:

- `Source`: `Deploy from a branch`
- `Branch`: `main`
- `Folder`: `/ (root)`

6. Salve e aguarde o link aparecer.

O site vai ficar em algo como:

`https://SEU_USUARIO.github.io/top-cartoes-free/`

## Dominio proprio

Se quiser usar um dominio proprio depois:

1. No GitHub Pages, adicione o dominio em `Custom domain`.
2. No painel do seu dominio, crie os registros DNS apontando para o GitHub Pages.

## Importante

- Nao publique a pasta `dist/premium` em repositorio publico.
- Nao publique `site/data/cards.json` em repositorio publico.
- Para Hotmart, use a build `dist/premium` separadamente.
