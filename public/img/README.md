# Diretório de Imagens (`public/img`)

Todas as imagens da aplicação devem ficar armazenadas neste diretório (`public/img`).

## Regras de Formato de Imagem:
1. **Formato Obrigatório (.webp)**:
   - Nenhuma imagem bitmap (JPG, JPEG, PNG, GIF, BMP, etc.) deve ser servida ou utilizada diretamente.
   - Qualquer imagem recebida via chat ou adicionada ao projeto deve ser convertida para o formato **WebP** (`.webp`) antes de ser salva na pasta `public/img/`.
   
2. **Exceção para Vetores (.svg)**:
   - Arquivos vetoriais em formato **SVG** (`.svg`) são a única exceção e podem ser mantidos/utilizados diretamente como `.svg`.

3. **Uso no Código React / HTML**:
   - As imagens devem ser referenciadas sempre pelo caminho relativo à raiz:
     - Imagem bitmap: `/img/nome-da-imagem.webp`
     - Vetor: `/img/nome-da-imagem.svg`

