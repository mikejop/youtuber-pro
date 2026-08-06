# UI Design Kit & Diretrizes de Design (AI Studio Build)

Este documento contém o Kit de Design completo e as diretrizes visuais e técnicas da aplicação. Ele serve como referência **imprescritível e definitiva** para a construção, manutenção e criação de novos sites e páginas no **AI Studio Build**.

---

## 📐 1. Filosofia de Design e Princípios Fundamentais

O design kit é inspirado na linguagem visual da **Apple (Human Interface Guidelines)**:
- **Photography & Content First**: A interface de usuário recua discretamente com tons neutros e linhas finas para destacar o conteúdo, simuladores e mídias.
- **Micro-interações de Precisão**: Respostas táteis a cliques (scale down no toque), transições suaves com `motion/react` e navegação baseada no conceito macOS/Finder.
- **Anti-"AI Slop"**:
  - ❌ Proibido usar gradientes de fundo extravagantes (roxo para azul neon, ciano em fundo escuro).
  - ❌ Proibido botões flutuantes extravagantes com sombras pesadas e brilhantes.
  - ❌ Proibido bordas coloridas grossas em um único lado de cards.
  - ✅ Permitido apenas gradientes neutros e sofisticados em títulos textuais.
  - ✅ Botões pill elegantes com sombra sutil de elevação e raios de curvatura matematicamente equilibrados (`rounded-xl`, `rounded-2xl`, `rounded-full`).

---

## 🖼️ 2. Regra Estrita de Gerenciamento de Imagens

Todas as aplicações devem seguir rigorosamente a seguinte convenção de arquivos de imagem:

1. **Diretório Obrigatório**:
   - Todas as imagens do projeto ficam armazenadas em `public/img/`.
2. **Formato WebP Obrigatório (`.webp`)**:
   - Nenhuma imagem bitmap em formato `.jpg`, `.jpeg`, `.png`, `.gif` ou `.bmp` deve ser servida ou adicionada ao código diretamente.
   - Imagens enviadas via chat ou criadas para a aplicação devem ser salvas/convertidas para o formato `.webp`.
3. **Exceção de Formato (`.svg`)**:
   - Arquivos vetoriais no formato **SVG** (`.svg`) são a única exceção permitida e podem ser armazenados e referenciados diretamente como `.svg`.
4. **Referência no Código (React/HTML)**:
   ```tsx
   // Exemplo de imagem bitmap (.webp)
   <img src="/img/foto-exemplo.webp" alt="Descrição" className="w-full h-auto rounded-2xl object-cover" />

   // Exemplo de vetor (.svg)
   <img src="/img/icone-exemplo.svg" alt="Ícone" className="w-6 h-6" />
   ```

---

## 🎨 3. Paleta de Cores e Tokens Visuais

| Categoria | Token / Valor | Classe Tailwind | Aplicação |
|---|---|---|---|
| **Ação Principal (Blue)** | `#0071e3` | `bg-[#0071e3]` / `text-[#0071e3]` | Botões primários, links ativos, indicadores de seleção |
| **Ação Hover** | `#147ce5` | `hover:bg-[#147ce5]` | Estado hover de botões primários |
| **Canvas / Background** | `#f5f5f7` | `bg-[#f5f5f7]` | Fundo da aplicação (Parchment Light Gray) |
| **Superfície / Card** | `#ffffff` | `bg-white` | Cartões, modais, barras laterais e painéis |
| **Texto Título / Ink** | `#1d1d1f` | `text-[#1d1d1f]` | Títulos principais, textos em alta prioridade |
| **Texto Corpo / Muted**| `#86868b` / `#6e6e73` | `text-[#86868b]` | Descrições, legendas, textos secundários |
| **Borda Suave** | `rgba(0,0,0,0.08)` / `#e5e5ea` | `border-neutral-200/80` / `border-[#e5e5ea]` | Divisores, limites de cards e botões secundários |
| **Status Sucesso / Badge**| Emerald | `bg-emerald-50 text-emerald-600 border-emerald-200` | Lições concluídas, status ativo, confirmações |
| **Status Alerta / Destaque**| Amber | `bg-amber-50 text-amber-700 border-amber-200` | Avisos, pendências, módulos em progresso |

---

## 🔤 4. Tipografia e Hierarquia Visual

- **Família Tipográfica**: `SF Pro Display`, `SF Pro Text`, `Inter`, `system-ui`, `sans-serif`.
- **Regra do Letter-Spacing (Tracking)**:
  - Títulos de `18px` ou mais recebem ajuste negativo (`tracking-tight` / `-0.02em`) para criar a cadência compacta clássica da Apple.
- **Gradiente Textual Elegante**:
  ```tsx
  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#636366]">
    Título Principal do Módulo
  </h1>
  ```

### Escala de Tamanhos Recomendada:
- **Display Hero**: `text-4xl` a `text-5xl` (`36px` - `48px`), `font-bold` / `font-semibold`.
- **Título de Seção**: `text-2xl` a `text-3xl` (`24px` - `30px`), `font-semibold`.
- **Subtítulo / Card Head**: `text-lg` a `text-xl` (`18px` - `20px`), `font-semibold`.
- **Corpo do Texto**: `text-sm` a `text-base` (`14px` - `16px`), `font-normal`, `leading-relaxed`.
- **Badges / Botões Úteis**: `text-xs` (`12px`), `font-semibold` ou `font-medium`.

---

## 🧩 5. Componentes e Blueprints de UI

### A. Frame de Janela macOS (Finder Window)
Utilize uma estrutura de janela flutuante com barra de controle superior e semáforo:
```tsx
<div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-neutral-200/80 shadow-2xl overflow-hidden max-w-7xl mx-auto my-6">
  {/* Header da Janela */}
  <div className="h-11 bg-neutral-100/80 border-b border-neutral-200/60 px-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10" />
      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10" />
      <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10" />
    </div>
    <span className="text-xs font-semibold text-[#86868b] tracking-wide">
      NOME DA APLICAÇÃO
    </span>
    <div className="w-16" /> {/* Espaçador de equilíbrio */}
  </div>

  {/* Conteúdo da Janela */}
  <div className="p-6">
    {/* Conteúdo Aqui */}
  </div>
</div>
```

### B. Botões (Button Specs)
1. **Botão Primário (Action Pill)**:
   ```tsx
   <button className="bg-[#0071e3] text-white text-xs px-4 py-2 rounded-full font-semibold hover:bg-[#147ce5] active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer">
     <span>Ação Principal</span>
   </button>
   ```

2. **Botão Secundário Neutral Pill**:
   ```tsx
   <button className="bg-neutral-100 text-[#1d1d1f] hover:bg-neutral-200 text-xs px-4 py-2 rounded-full font-medium active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer">
     <span>Ação Secundária</span>
   </button>
   ```

3. **Botão Transparente com Borda**:
   ```tsx
   <button className="border border-neutral-200 text-[#1d1d1f] hover:bg-neutral-50 text-xs px-4 py-2 rounded-full font-medium transition-all">
     <span>Ver Detalhes</span>
   </button>
   ```

### C. Cards Interativos (Feature Cards)
```tsx
<div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all">
  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0071e3] mb-4">
    {/* Ícone Lucide */}
  </div>
  <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2 tracking-tight">
    Título do Card
  </h3>
  <p className="text-sm text-[#86868b] leading-relaxed mb-4">
    Descrição do elemento com contraste e espaçamento otimizado.
  </p>
</div>
```

### D. Badges e Tags de Status
```tsx
// Concluído / Sucesso
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
  Concluído
</span>

// Em Progresso / Alerta
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0071e3] border border-blue-200/60">
  Em Progresso
</span>
```

---

## ⚡ 6. Animações e Transições (`motion/react`)

Sempre utilizar a biblioteca `motion/react` para animações fluidas de montagem, abas e diálogos:

```tsx
import { motion, AnimatePresence } from 'motion/react';

// Animação Padrão de Card / Container
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -12 }}
  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
>
  {/* Conteúdo Animado */}
</motion.div>

// Indicador de Aba Ativa (LayoutId Underline)
{isActive && (
  <motion.div
    layoutId="activeTabUnderline"
    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0071e3]"
    transition={{ type: "spring", stiffness: 500, damping: 35 }}
  />
)}
```

---

## 📱 7. Design Responsivo e Grid Layout

- **Container Padrão**: `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Breakpoints**:
  - `sm:` (640px): Ajustes de telas pequenas
  - `md:` (768px): Adaptação de barra lateral e grids de 2 colunas
  - `lg:` (1024px): Layouts de 3 colunas e telas completas
  - `xl:` (1280px): Expansão máxima
- **Touch Targets**: Botões no mobile possuem área de toque mínima de `44px` de altura.

---

## 🤖 8. Checklist para AI Studio Build ao Gerar Próximas UIs

Quando o **AI Studio Build** for criar ou modificar páginas futuras, ele DEVE verificar os seguintes itens:

1. [ ] **Verificar imagens**: Todas as imagens bitmaps salvas/referenciadas usam a pasta `public/img/` e extensão `.webp`? (Com exceção dos vetores `.svg`).
2. [ ] **Verificar cores**: O tom de azul de ação primária é exatamente `#0071e3` e o fundo é `#f5f5f7` ou `white`?
3. [ ] **Verificar botões**: Os botões primários são pills (`rounded-full`) sem ícones desnecessários (quando for texto simples como Login)?
4. [ ] **Verificar animações**: Importa-se `motion/react` (e NÃO `framer-motion`) para os efeitos de entrada e estado das abas?
5. [ ] **Verificar ícones**: Os ícones vêm exclusivamente da biblioteca `lucide-react`?
6. [ ] **Verificar estado de compilação**: O código compila limpo via `compile_applet` sem erros de TypeScript e sem dependências ausentes?

---
*Este Kit de Design garante consistência total, elegância de nível profissional e padrão Apple HIG para todas as interfaces criadas no AI Studio Build.*
