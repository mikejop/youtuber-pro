<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# YouTuber Pro Academy

Aplicação web e plataforma de estudo para videomakers, YouTubers e criadores de conteúdo.

## 🚀 Padrão de Desenvolvimento e Deploys (GitHub Workflow)

Para qualquer **Correção**, **Melhoria** ou **Nova Funcionalidade**:

1. **Criação da Issue**: Crie uma Issue no GitHub descrevendo o problema ou nova feature.
   `gh issue create --title "tipo/titulo-da-task" --body "Descrição detalhada"`
2. **Branch de Trabalho**: Crie uma branch a partir da `main`.
   `git checkout -b feat/nome-da-feature` ou `git checkout -b fix/nome-do-bug`
3. **Pull Request (PR)**: Abra um Pull Request e obrigatoriamente mencione a Issue criada.
   `gh pr create --title "..." --body "Closes #1"`
4. **Merge & Deploy**: Faça o merge do PR para atualizar a branch `main` e acionar o deploy.

---

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the environment variables in `.env`
3. Run the app:
   `npm run dev`
