# Regras do Projeto (Project Rules)

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

