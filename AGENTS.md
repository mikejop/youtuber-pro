# Regras do Projeto (Project Rules)

## Fluxo Obrigatório de Desenvolvimento com GitHub (GitHub Workflow Rules)
- **Criação Obrigatória de Issue**:
  - Toda e qualquer tarefa (seja de **Correção**, **Melhoria** ou **Nova Função**) DEVE obrigatoriamente ter uma **Issue criada no GitHub** descrevendo o objetivo e escopo antes da implementação.
  - Exemplo: `gh issue create --title "..." --body "..."`
- **Trabalhar com Feature Branches**:
  - As alterações devem ser desenvolvidas em branches separadas (ex: `feat/nome-da-feature`, `fix/nome-do-bug`, `chore/task-name`).
- **Abertura de Pull Request (PR)**:
  - Todas as alterações devem passar por **Pull Requests (PR)** para gerenciar a integração e os deploys.
- **Mencionar a Issue Obrigatoriamente na Descrição do PR**:
  - A descrição do Pull Request DEVE obrigatoriamente citar e vincular a Issue criada (ex: `Closes #1`, `Fixes #2` ou `Resolves #3`).
- **Merge & Deploy**:
  - O merge do PR na branch `main` (`gh pr merge --auto --squash` ou `gh pr merge --merge`) é o responsável por disparar a esteira de deploy para produção.

## Gerenciamento e Formato de Imagens
- Todas as imagens do projeto devem ser armazenadas exclusivamente na pasta `public/img/`.
- **Imagens de Plano de Fundo (Backgrounds)**:
  - Devem ser salvas na subpasta dedicada `public/img/bg/` (ex: `/img/bg/bg_studio.webp`).
- **Formato WebP Obrigatório**:
  - Todas as imagens bitmaps recebidas pelo chat ou criadas para a aplicação **devem ser convertidas para o formato `.webp`**.
  - O site **NÃO deve rodar** formatos como `.jpg`, `.jpeg`, `.png`, `.gif` diretamente.
- **Exceção de Formato**:
  - A única exceção ao WebP são arquivos **SVG** (`.svg`), que podem ser utilizados e armazenados diretamente como `.svg`.
- **Referência no Código**:
  - No código (componentes React/HTML), todas as imagens devem ser referenciadas utilizando o caminho `/img/nome-da-imagem.webp` (ou `/img/bg/nome-da-imagem.webp` para backgrounds).
