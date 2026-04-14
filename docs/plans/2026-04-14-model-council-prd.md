# Model Council - Product Requirements Document

**Date:** 2026-04-14
**Author:** Sourabh Bhaumik
**Status:** Draft
**Version:** 2.0

---

## 1. Product Vision

Model Council is a web application where four leading AI models — **GPT-5** (OpenAI), **Claude Sonnet 4.6** (Anthropic), **Gemini 3.1 Pro** (Google), and **Grok 4** (xAI) — publicly debate any question or statement through three structured rounds, then an independent Chairperson delivers a unified final verdict.

Think of it as a **public city council meeting for AI**: four council members with distinct perspectives deliberate openly, challenge each other's reasoning, and arrive at a decisive conclusion. The user watches the debate unfold in real time and receives a synthesized verdict that is more reliable, balanced, and well-reasoned than any single model alone.

**Goal:** Match or exceed Perplexity's output quality by leveraging the collective intelligence of multiple frontier models — cross-validating facts, exposing blind spots, and producing consensus-driven answers.

**Tagline:** *"Don't trust one AI. Let four debate it."*

---

## 2. Problem Statement

### Why single-model answers fall short

- Every AI model has blind spots, training biases, and knowledge gaps
- Users cannot tell when a model is confidently wrong
- Different models excel at different types of reasoning (logic, creativity, factual recall, contrarian thinking)
- Users currently must manually query multiple AI tools and synthesize answers themselves
- No existing product shows you the reasoning process across models transparently

### What Model Council solves

- **Cross-validation**: Four models fact-check each other in real time
- **Bias reduction**: Disagreements surface where individual models might be wrong
- **Comprehensive coverage**: Each model brings different training data and reasoning styles
- **Transparency**: The full deliberation is visible — users see how the conclusion was reached
- **Decisive output**: Instead of four separate answers, users get one well-reasoned verdict with confidence scoring

---

## 3. Target Users

| Segment | Use Case |
|---------|----------|
| **Knowledge workers** | Research questions, strategic decisions, fact-checking claims |
| **Students & researchers** | Complex topics requiring multiple academic perspectives |
| **Business professionals** | Market analysis, risk assessment, decision support |
| **Curious minds** | Controversial topics, philosophical questions, open debates |
| **Content creators** | Well-rounded takes on trending topics, balanced article research |
| **Developers & AI enthusiasts** | Comparing model capabilities, testing reasoning quality |

---

## 4. Core Concept: The Council Meeting

The product imitates a **public city council meeting** with defined roles, procedures, and a gavel.

### 4.1 Council Members

All models are accessed via **OpenRouter** (single API, single key, unified interface).

| Seat | Model | OpenRouter ID | Role | Context | Cost (Input/Output per M tokens) |
|------|-------|---------------|------|---------|-----------------------------------|
| **Member 1** | GPT-5 | `openai/gpt-5` | The Analyst | 400K | $1.25 / $10.00 |
| **Member 2** | Claude Sonnet 4.6 | `anthropic/claude-sonnet-4.6` | The Reasoner | 1M | $3.00 / $15.00 |
| **Member 3** | Gemini 3.1 Pro | `google/gemini-3.1-pro-preview` | The Challenger | 1M | $2.00 / $12.00 |
| **Member 4** | Grok 4 | `x-ai/grok-4` | The Maverick | 256K | $3.00 / $15.00 |

**Role Descriptions:**

- **The Analyst (GPT-5):** Structured, data-driven, methodical. Leads with facts, frameworks, and evidence-based reasoning. Breaks complex questions into measurable components.
- **The Reasoner (Claude Sonnet 4.6):** Nuanced, considers edge cases, bridges perspectives. Explores deeper implications, second-order effects, and who is affected.
- **The Challenger (Gemini 3.1 Pro):** Contrarian, stress-tests assumptions. Questions what others take for granted, brings counterexamples, plays devil's advocate.
- **The Maverick (Grok 4):** Bold, unconventional, cuts through noise. Brings fresh angles, challenges conventional wisdom, willing to take controversial positions with humor.

### 4.2 The Chairperson

After 3 rounds of debate, an independent **Chairperson** reads the full transcript and delivers the final verdict. The Chairperson is NOT one of the four debaters — it is a separate, impartial judge.

| Role | Model | OpenRouter ID | Cost (Input/Output per M tokens) |
|------|-------|---------------|-----------------------------------|
| **Chairperson** | Claude Opus 4.6 | `anthropic/claude-opus-4.6` | $5.00 / $25.00 |

*Claude Opus 4.6 is selected as Chairperson because of its 1M context window (fits the full debate transcript), deep reasoning capability, and synthesis strength.*

### 4.3 Budget-Conscious Alternatives

For cost-sensitive deployments, these models can substitute without major quality loss:

| Role | Budget Model | OpenRouter ID | Cost (Input/Output per M tokens) |
|------|-------------|---------------|-----------------------------------|
| Member 1 | GPT-5 Mini | `openai/gpt-5-mini` | $0.25 / $2.00 |
| Member 2 | Claude Haiku 4.5 | `anthropic/claude-haiku-4.5` | $1.00 / $5.00 |
| Member 3 | Gemini 2.5 Flash | `google/gemini-2.5-flash` | $0.30 / $2.50 |
| Member 4 | Grok 4.1 Fast | `x-ai/grok-4.1-fast` | $0.20 / $0.50 |
| Chairperson | Claude Opus 4.5 | `anthropic/claude-opus-4.5` | $5.00 / $25.00 |

### 4.4 Full Model Roster (Available via OpenRouter)

These additional models are available for future "custom council" features:

| Provider | Frontier Models | Budget Models |
|----------|----------------|---------------|
| **OpenAI** | gpt-5, gpt-5-pro, gpt-4.1 | gpt-5-mini, gpt-5-nano, gpt-4.1-mini |
| **Anthropic** | claude-opus-4.6, claude-sonnet-4.6 | claude-haiku-4.5, claude-sonnet-4 |
| **Google** | gemini-3.1-pro-preview, gemini-2.5-pro | gemini-3-flash-preview, gemini-2.5-flash |
| **xAI** | grok-4, grok-4.20 | grok-4-fast, grok-4.1-fast, grok-3-mini |
| **DeepSeek** | deepseek-r1, deepseek-v3.2 | deepseek-chat, deepseek-r1-0528 |
| **Meta** | llama-4-maverick | llama-4-scout, llama-3.3-70b |
| **Mistral** | mistral-large-2512 | mistral-medium-3.1, mistral-small-2603 |
| **Qwen** | qwen3-max, qwen3.6-plus | qwen3-coder, qwen-plus |

---

## 5. How a Council Session Works

### 5.1 Flow Diagram

```
User submits question / statement
         |
    ROUND 1: OPENING STATEMENTS
    [GPT-5, Claude, Gemini, Grok respond in parallel]
    [All 4 responses become visible to all models]
         |
    ROUND 2: CROSS-EXAMINATION
    [Each model reads all other Round 1 responses]
    [Each model critiques, agrees, or challenges specific points]
    [All 4 Round 2 responses become visible]
         |
    ROUND 3: FINAL ARGUMENTS
    [Each model reads all Round 1 + Round 2 responses]
    [Each model presents its refined, final position]
    [Highlights consensus, flags remaining disagreements]
         |
    VERDICT: CHAIRPERSON SYNTHESIS
    [Independent Chairperson (Claude Opus 4.6) reads the entire 3-round transcript]
    [Produces: decisive answer, confidence level, consensus areas, dissenting views]
         |
    User sees full debate + final verdict
```

### 5.2 Round Details

#### Round 1: Opening Statements
- **Input to each model**: User's original question only + role system prompt
- **Output**: Each model's independent first take (500-800 words each)
- **Purpose**: Get four unbiased, independent perspectives
- **Execution**: All four run in parallel — no model sees another's answer yet
- **Streaming**: Each model's response streams to the UI as it generates

#### Round 2: Cross-Examination
- **Input to each model**: User's question + all four Round 1 responses (labeled by role name) + round-2 system prompt
- **Output**: Each model's critique and refinement (400-600 words each)
- **Purpose**: Models challenge each other's claims, point out errors, acknowledge strong points
- **Execution**: All four run in parallel after Round 1 completes
- **Key rule**: Models must reference other members by role name ("The Analyst argues..." not "GPT-5 says...")

#### Round 3: Final Arguments
- **Input to each model**: User's question + all Round 1 + all Round 2 responses + round-3 system prompt
- **Output**: Each model's final position (300-500 words each)
- **Purpose**: Convergence — models move toward common ground or clearly explain why they disagree
- **Execution**: All four run in parallel after Round 2 completes

#### Verdict: Chairperson Synthesis
- **Input**: User's question + the entire 3-round transcript (all 12 responses)
- **Output**: Structured final verdict (600-1000 words)
- **Model**: Claude Opus 4.6 (independent, did not participate in debate)
- **Purpose**: Impartial judge produces the definitive answer
- **Verdict structure**:
  - **TL;DR** — one-paragraph decisive answer (2-3 sentences)
  - **Consensus Points** — what all four models agreed on
  - **Key Debates** — where models disagreed and how it evolved across rounds
  - **Dissenting Views** — minority opinions worth preserving
  - **Confidence Level** — HIGH / MEDIUM / LOW with justification
  - **Final Reasoning** — the logic chain supporting the verdict

---

## 6. User Interface Design

### 6.1 Design System: "Poster Modernist"

The UI follows a **Reality-First** design language — structured, modernist, and technical. It rejects typical SaaS fluff in favor of high typographic contrast, strict grid discipline, and a monochromatic palette with a single vibrant accent.

#### 6.1.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#E3E2DE` | Primary background (Cream) |
| `--color-accent` | `#1351AA` | Primary accent (Cobalt Blue) — links, active states, key highlights |
| `--color-text` | `#141414` | Primary text (Jet Black) |
| `--color-text-secondary` | `#444343` | Body text, descriptions (Deep Gray) |
| `--color-text-muted` | `#7A7A7A` | Labels, metadata, sidebar text (Gray) |
| `--color-border` | `#C7C7C7` | Dividers, section borders (Light Gray) |

**Rules:**
- No gradients. No shadows. Flat color blocks only.
- Cobalt Blue (`#1351AA`) is the ONLY accent color. Use sparingly for maximum impact.
- All interactive elements use blue on hover/active.

#### 6.1.2 Typography

| Element | Size | Weight | Line-height | Letter-spacing | Transform |
|---------|------|--------|-------------|----------------|-----------|
| **Hero Headlines** | 8rem - 12rem | 900 (Black) | 0.85 | -0.04em | Uppercase or normal |
| **Section Headlines** | 5rem - 7rem | 700 | 0.9 | -0.03em | — |
| **Page Headlines** | 3rem - 4rem | 700 | 0.95 | -0.02em | — |
| **Body Text** | 1.125rem | 400 | 1.5 | normal | — |
| **Labels / UI** | 0.75rem | 700 | 1.2 | 0.2em | Uppercase |
| **Mono (indexes)** | 0.875rem | 400 | 1.4 | 0.05em | — |

**Font Family:** `'General Sans'` or `'Aileron'` (sans-serif). Monospace for code, indexes, and technical labels.

#### 6.1.3 Structural Rules

- **Grid**: Strict 12-column layout. Columns 1-3 reserved for section labels/metadata. Columns 4-12 for primary content.
- **Borders**: All sections separated by `1px solid #C7C7C7`. No border-radius (0px corners throughout).
- **Shadows**: None. Use flat color blocks for visual hierarchy.
- **Animations**: Fast, linear transitions (0.3s) for color changes only. No bouncy or organic easing.
- **Spacing**: 8px base unit. Consistent multiples (16, 24, 32, 48, 64, 96).

### 6.2 Navigation Bar

Sticky bar, 80px height, `1px solid #C7C7C7` bottom border.

- Background: `#E3E2DE` at 95% opacity with `backdrop-blur(12px)`
- 12-column grid layout:
  - **Cols 1-3**: Logo — `MODEL COUNCIL` in uppercase, bold, tight tracking (`-0.03em`)
  - **Cols 4-9**: Empty or session status indicator (e.g., "Round 2 in progress...")
  - **Cols 10-12**: Right-aligned nav links — `text-sm`, `font-semibold`. Items: `History`, `About`, `Sign In`

### 6.3 Home Page (Hero Section)

Minimum height `85vh`. Split into 12 columns.

```
+------------------------------------------------------------------+
| [Cols 1-3]              |  [Cols 4-12]                           |
|                         |                                         |
| MANIFESTO               |  DON'T TRUST                           |
| [16px black square]     |  ONE AI.                               |
|                         |  LET FOUR                               |
| (vertical 1px border    |  DEBATE IT.          <-- "DEBATE" in   |
|  on right edge)         |                         Cobalt Blue     |
|                         |  Four frontier models deliberate your   |
|                         |  question through three rounds of       |
|                         |  structured debate, then deliver a      |
|                         |  unified verdict.                       |
|                         |                                         |
|                         |  [ASK THE COUNCIL]   Learn how it works |
|                         |   ^ solid blue btn    ^ underlined link |
+------------------------------------------------------------------+
```

- Hero headline: `6xl` to `9xl`, tight leading (0.85), one keyword colored Cobalt Blue
- Subtitle: 400px max-width paragraph, `color: #444343`
- CTA cluster: One `Poster Button` (primary, blue) + one underlined text link

### 6.4 Council Session Page (The Main Experience)

This is the core product page. Each round unfolds vertically with the sidebar label pattern.

```
+------------------------------------------------------------------+
| NAV: MODEL COUNCIL          Round 2 of 3...          History  About|
+------------------------------------------------------------------+
|                                                                    |
| [Cols 1-3]              |  [Cols 4-12]                            |
|                         |                                          |
| QUESTION                |  "Should startups prioritize revenue     |
| Session #4291           |   or growth in 2026?"                    |
| 2026-04-14              |                                          |
| Est. 80 seconds         |                                          |
|                         +------------------------------------------+
|                         |                                          |
| ROUND 01                |  +----------+ +----------+ +----------+ |
| OPENING                 |  | GPT-5    | | CLAUDE   | | GEMINI   | |
| STATEMENTS              |  | Analyst  | | Reasoner | | Challngr | |
|                         |  |          | |          | |          | |
| (sticky, top-32)        |  | [text    | | [text    | | [text    | |
|                         |  |  flows]  | |  flows]  | |  flows]  | |
|                         |  +----------+ +----------+ +----------+ |
|                         |                                          |
|                         |  +----------+                            |
|                         |  | GROK     |                            |
|                         |  | Maverick |                            |
|                         |  | [text]   |                            |
|                         |  +----------+                            |
|                         +------------------------------------------+
|                         |                                          |
| ROUND 02                |  +----------+ +----------+ +----------+ |
| CROSS-                  |  | GPT-5    | | CLAUDE   | | GEMINI   | |
| EXAMINATION             |  | "I agree | | "The     | | "Both    | |
|                         |  |  with    | |  Analyst | |  models  | |
| (sticky, top-32)        |  |  The..." | |  raises."| |  miss.." | |
|                         |  | [stream] | | [stream] | | [stream] | |
|                         |  +----------+ +----------+ +----------+ |
|                         |                                          |
|                         |  +----------+                            |
|                         |  | GROK     |                            |
|                         |  | [stream] |                            |
|                         |  +----------+                            |
|                         +------------------------------------------+
|                         |                                          |
| ROUND 03                |  [Waiting for Round 2 to complete...]   |
| FINAL                   |                                          |
| ARGUMENTS               |                                          |
|                         +------------------------------------------+
|                         |                                          |
| VERDICT                 |  [Waiting for Round 3 to complete...]   |
|                         |                                          |
+------------------------------------------------------------------+
```

**Layout rules:**
- Each round is a full-width section separated by `1px solid #C7C7C7`
- Sidebar label (Cols 1-3): sticky with `top: 128px` (below nav), `0.75rem`, `font-bold`, `uppercase`, `tracking-0.2em`, `color: #7A7A7A`
- Model cards: Equal-width within the 9-column content area, `1px solid #C7C7C7` borders, `0px border-radius`
- Card header: Model name in bold + role in muted text
- Card body: Streaming text in `color: #444343`, `1.125rem`, `line-height: 1.5`
- Active card (streaming): Left border `3px solid #1351AA`
- Completed card: Normal border, full text visible
- Waiting state: Card background `#F0EFEB` (slightly darker cream), text "Waiting..."

**Progress indicator:**
- Between nav and content: a thin progress bar (`2px height`, `background: #1351AA`)
- Shows completion as: `Round 1 [====] Round 2 [==  ] Round 3 [    ] Verdict [    ]`

### 6.5 Verdict Panel

The verdict gets a distinct treatment — it's the payoff. Full-width, no sidebar split.

```
+------------------------------------------------------------------+
|                                                                    |
|  COUNCIL VERDICT                           Confidence: HIGH        |
|  ─────────────────────────────────────────────────────────────     |
|                                                                    |
|  TL;DR                                                             |
|  Revenue-first for bootstrapped startups; growth-first only with   |
|  18+ months runway and a clear, proven path to monetization.       |
|  ─────────────────────────────────────────────────────────────     |
|                                                                    |
|  01  CONSENSUS                                                     |
|  ·  Context matters more than a universal rule                     |
|  ·  Unit economics must be positive before scaling                 |
|  ·  "Growth at all costs" era ended post-2022                      |
|  ·  Hybrid approach is almost always superior to pure extremes     |
|                                                                    |
|  02  KEY DEBATES                                                   |
|  The Analyst and The Reasoner disagreed on whether Series A        |
|  startups should prioritize growth. The Challenger sided with      |
|  The Reasoner after Round 2, citing 2025 market data. The         |
|  Maverick argued the question itself is a false dichotomy.         |
|                                                                    |
|  03  DISSENTING VIEWS                                              |
|  The Analyst maintained that network-effect businesses are an      |
|  exception where growth should always come first. The Maverick     |
|  argued that "revenue vs growth" is an outdated framing — the      |
|  real question is capital efficiency.                               |
|                                                                    |
|  04  CONFIDENCE ASSESSMENT                                         |
|  HIGH — Strong consensus on core principles with productive        |
|  tactical disagreements. All four members converged on hybrid      |
|  approach; differences were in implementation details.              |
|                                                                    |
|  05  REASONING CHAIN                                               |
|  [The full logic chain supporting the verdict...]                  |
|                                                                    |
+------------------------------------------------------------------+
|  [COPY VERDICT]    [SHARE LINK]    [DOWNLOAD PDF]    [NEW SESSION] |
+------------------------------------------------------------------+
```

**Verdict styling:**
- Background: `#FFFFFF` (white — breaks from cream to signal importance)
- Border: `2px solid #1351AA` top edge
- TL;DR block: `font-size: 1.5rem`, `font-weight: 700`, `color: #141414`
- Section numbers: Monospace, `color: #7A7A7A`
- Confidence badge: Pill shape (exception to 0px radius rule — `4px radius`), background varies:
  - HIGH: `#1351AA` text on `#E8EEF7` background
  - MEDIUM: `#8B6914` text on `#F5F0E0` background
  - LOW: `#AA1313` text on `#F7E8E8` background
- Action buttons: `Poster Button` style (0px radius, uppercase, bold)

### 6.6 Feature / System Grid (How It Works Section)

Used on the home page to explain the council process.

```
+------------------------------------------------------------------+
| [Cols 1-3]              |  [Cols 4-12]                            |
|                         |                                          |
| SYSTEM                  |  HOW THE                                 |
|                         |  COUNCIL                                 |
|                         |  WORKS                                   |
|                         |                                          |
|                         |  +----------+ +----------+ +----------+ |
|                         |  | 01       | | 02       | | 03       | |
|                         |  | OPENING  | | CROSS-   | | FINAL    | |
|                         |  | STATE-   | | EXAM-    | | ARGU-    | |
|                         |  | MENTS    | | INATION  | | MENTS    | |
|                         |  |          | |          | |          | |
|                         |  | Four     | | Models   | | Each     | |
|                         |  | models   | | read     | | model    | |
|                         |  | answer   | | each     | | presents | |
|                         |  | indep-   | | other's  | | its      | |
|                         |  | endently | | work and | | final    | |
|                         |  |          | | debate   | | position | |
|                         |  +----------+ +----------+ +----------+ |
+------------------------------------------------------------------+
```

- Grid cells: `1px solid #C7C7C7` borders, no radius
- Index number: Monospace, `color: #7A7A7A`, top-left of cell
- Title: `h3`, `font-weight: 700`
- Description: `font-size: 0.875rem`, `color: #444343`
- Hover state: Background transitions to `rgba(255,255,255,0.2)` over `0.3s`

### 6.7 Comparison List (Why Different Section)

Vertical list explaining differentiation from competitors.

```
+------------------------------------------------------------------+
| [Cols 1-3]              |  [Cols 4-12]                            |
|                         |                                          |
| WHY DIFFERENT           |  ──────────────────────────────────────  |
|                         |  001   MULTI-MODEL REASONING             |
|                         |  ──────────────────────────────────────  |
|                         |  002   TRANSPARENT DELIBERATION          |
|                         |  ──────────────────────────────────────  |
|                         |  003   CROSS-VALIDATION                  |
|                         |  ──────────────────────────────────────  |
|                         |  004   CONSENSUS CONFIDENCE              |
|                         |  ──────────────────────────────────────  |
|                         |  005   BIAS DETECTION                    |
|                         |                                          |
+------------------------------------------------------------------+
```

- Each item: `100-150px` tall, `1px solid #C7C7C7` top border
- Index: Monospace, `color: #7A7A7A`
- Title: `text-5xl` (`3rem`), `font-weight: 700`
- Hover: Title transitions from `#141414` to `#1351AA` over `0.3s`

### 6.8 Pricing / Access Section

```
+------------------------------------------------------------------+
| [Cols 1-3]              |  [Cols 4-12]                            |
|                         |                                          |
| ACCESS                  |  START                                   |
|                         |  EXPLORING                               |
|                         |                                          |
|                         |  Three free sessions daily.              |
|                         |  No sign-up required.                    |
|                         |                                          |
|                         |              [ASK THE COUNCIL]           |
|                         |               ^ black bg, cream text     |
|                         |               padding: 20px 40px         |
+------------------------------------------------------------------+
```

- Minimum height: `50vh`
- Headline: `8xl` (`6rem`), `font-weight: 900`
- CTA: `Poster Button` secondary variant — `background: #141414`, `color: #E3E2DE`, `padding: 20px 40px`

### 6.9 Special Components

#### Poster Button
```css
.poster-button {
  border-radius: 0px;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: background-color 0.3s linear;
  cursor: pointer;
  border: none;
}
.poster-button--primary {
  background: #1351AA;
  color: #E3E2DE;
}
.poster-button--primary:hover {
  background: #141414;
}
.poster-button--secondary {
  background: #141414;
  color: #E3E2DE;
}
.poster-button--secondary:hover {
  background: #1351AA;
}
```

#### Typographic List Item
```css
.typo-list-item {
  border-top: 1px solid #C7C7C7;
  border-radius: 0;
  padding: 24px 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  min-height: 100px;
}
.typo-list-item__index {
  font-family: monospace;
  font-size: 0.875rem;
  color: #7A7A7A;
}
.typo-list-item__title {
  font-size: 3rem;       /* text-5xl */
  font-weight: 700;
  color: #141414;
  transition: color 0.3s linear;
}
.typo-list-item:hover .typo-list-item__title {
  color: #1351AA;
}
```

#### Grid Sidebar Label
```css
.sidebar-label {
  grid-column: 1 / 4;    /* 3-column width */
  position: sticky;
  top: 128px;             /* below 80px nav + 48px buffer */
  font-size: 0.75rem;
  font-weight: 700;
  color: #7A7A7A;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  align-self: start;
}
```

### 6.10 Session History Page

- Sidebar label: `HISTORY`
- Content: Vertical list of past sessions using `Typographic List Item` pattern
- Each item shows: session index (mono), question text (bold, `text-2xl`), date, confidence badge
- Hover: Question text turns Cobalt Blue
- Click: Opens full session with all rounds and verdict

---

## 7. Technical Architecture

### 7.1 System Architecture

```
                    +-------------------+
                    |   Frontend (Web)  |
                    |   Next.js 15      |
                    |   React 19        |
                    |   Tailwind CSS    |
                    +--------+----------+
                             |
                             | SSE (streaming debate)
                             | REST (CRUD, sessions)
                             |
                    +--------+----------+
                    |   Backend API     |
                    |   Python FastAPI  |
                    +--------+----------+
                             |
                             | Single API key
                             | Unified endpoint
                             |
                    +--------+----------+
                    |   OpenRouter      |
                    |   (API Gateway)   |
                    +--------+----------+
                             |
              +---------+---------+---------+
              |         |         |         |
           +--+--+   +--+--+  +--+--+  +--+--+
           |GPT-5|   |Claude|  |Gemini|  |Grok |
           |     |   |Sonnet|  |3.1Pro|  | 4   |
           +-----+   +------+  +------+  +-----+
                             |
                    +--------+----------+
                    |   Database        |
                    |   PostgreSQL      |
                    |   (Supabase)      |
                    +-------------------+
```

**Key simplification:** OpenRouter eliminates the need for separate API keys and SDK integrations for each provider. One endpoint, one key, all models.

### 7.2 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 + React 19 + Tailwind CSS v4 | SSR for SEO, streaming support, rapid UI development |
| **Backend** | Python 3.12 + FastAPI | Async-native, excellent for streaming, simple OpenRouter integration |
| **Database** | PostgreSQL via Supabase | JSON support for session data, built-in auth, real-time subscriptions |
| **API Gateway** | OpenRouter | Single key for all models, unified API, automatic fallbacks |
| **Streaming** | Server-Sent Events (SSE) | Simpler than WebSocket for one-directional model output streaming |
| **Auth** | Supabase Auth | Free tier, Google/GitHub social login, row-level security |
| **Hosting** | Vercel (frontend) + Railway (backend) | Auto-scaling, easy deployment, generous free tiers |
| **Font** | General Sans (Google Fonts / self-hosted) | Matches the Poster Modernist design system |

### 7.3 OpenRouter Integration

All model calls go through a single function:

```python
import httpx

OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions"

async def call_model(
    model_id: str,
    system_prompt: str,
    user_content: str,
    stream: bool = True
) -> AsyncIterator[str]:
    """Call any model via OpenRouter with streaming."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            OPENROUTER_BASE,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://modelcouncil.ai",
                "X-Title": "Model Council"
            },
            json={
                "model": model_id,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                "stream": stream,
                "max_tokens": 2000
            },
            timeout=60.0
        )
        # Stream chunks to caller
        async for line in response.aiter_lines():
            if line.startswith("data: "):
                chunk = json.loads(line[6:])
                if content := chunk["choices"][0]["delta"].get("content"):
                    yield content
```

### 7.4 API Design

#### Start a Council Session
```
POST /api/sessions
Body: {
  "question": "Should startups prioritize revenue or growth?",
  "tier": "frontier"  // "frontier" | "budget"
}
Response: {
  "session_id": "cs_4291",
  "status": "round_1_started",
  "models": ["openai/gpt-5", "anthropic/claude-sonnet-4.6", "google/gemini-3.1-pro-preview", "x-ai/grok-4"],
  "chairperson": "anthropic/claude-opus-4.6"
}
```

#### Stream Session Updates (SSE)
```
GET /api/sessions/{session_id}/stream
Response: Server-Sent Events

event: round_start
data: {"round": 1, "label": "Opening Statements"}

event: model_chunk
data: {"model": "openai/gpt-5", "role": "The Analyst", "round": 1, "text": "..."}

event: model_complete
data: {"model": "openai/gpt-5", "round": 1, "tokens": 847, "latency_ms": 12400}

event: round_complete
data: {"round": 1, "duration_ms": 14200}

event: verdict_start
data: {"chairperson": "anthropic/claude-opus-4.6"}

event: verdict_chunk
data: {"text": "..."}

event: session_complete
data: {"session_id": "cs_4291", "confidence": "high", "total_tokens": 98200, "cost_usd": 1.42, "duration_ms": 78000}
```

#### Get Session (full result)
```
GET /api/sessions/{session_id}
Response: Full session JSON with all rounds, responses, and verdict
```

#### List Sessions (history)
```
GET /api/sessions?limit=20&offset=0
Response: Paginated list of past sessions with question, confidence, date
```

### 7.5 Database Schema

```sql
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users,
  question        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'round_1',
  -- Status: 'round_1' | 'round_2' | 'round_3' | 'verdict' | 'complete' | 'failed'
  tier            TEXT NOT NULL DEFAULT 'frontier',
  -- Tier: 'frontier' | 'budget'
  verdict_tldr    TEXT,
  verdict_full    JSONB,
  confidence      TEXT,
  -- Confidence: 'high' | 'medium' | 'low'
  total_tokens    INTEGER DEFAULT 0,
  total_cost_usd  DECIMAL(10,4) DEFAULT 0,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES sessions ON DELETE CASCADE,
  round           INTEGER NOT NULL,
  -- Round: 1, 2, 3 (debate) or 4 (verdict)
  model_id        TEXT NOT NULL,
  -- e.g., 'openai/gpt-5'
  role_name       TEXT NOT NULL,
  -- e.g., 'The Analyst', 'The Reasoner', 'The Challenger', 'The Maverick', 'Chairperson'
  content         TEXT NOT NULL,
  tokens_input    INTEGER,
  tokens_output   INTEGER,
  cost_usd        DECIMAL(10,4),
  latency_ms      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_responses_session_round ON responses(session_id, round);
CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);
```

### 7.6 Orchestration Logic (Core Engine)

```python
COUNCIL_MODELS = {
    "frontier": {
        "analyst":    {"id": "openai/gpt-5",                    "role": "The Analyst"},
        "reasoner":   {"id": "anthropic/claude-sonnet-4.6",     "role": "The Reasoner"},
        "challenger": {"id": "google/gemini-3.1-pro-preview",   "role": "The Challenger"},
        "maverick":   {"id": "x-ai/grok-4",                    "role": "The Maverick"},
    },
    "budget": {
        "analyst":    {"id": "openai/gpt-5-mini",              "role": "The Analyst"},
        "reasoner":   {"id": "anthropic/claude-haiku-4.5",     "role": "The Reasoner"},
        "challenger": {"id": "google/gemini-2.5-flash",        "role": "The Challenger"},
        "maverick":   {"id": "x-ai/grok-4.1-fast",            "role": "The Maverick"},
    },
    "chairperson": {
        "frontier": "anthropic/claude-opus-4.6",
        "budget":   "anthropic/claude-opus-4.5",
    }
}

async def run_council_session(question: str, tier: str = "frontier"):
    session = create_session(question, tier)
    models = COUNCIL_MODELS[tier]
    chair_model = COUNCIL_MODELS["chairperson"][tier]

    # ROUND 1: Parallel, independent — no model sees another's answer
    round1 = await asyncio.gather(
        call_model(models["analyst"]["id"],    PROMPTS["analyst_r1"],    question),
        call_model(models["reasoner"]["id"],   PROMPTS["reasoner_r1"],   question),
        call_model(models["challenger"]["id"], PROMPTS["challenger_r1"], question),
        call_model(models["maverick"]["id"],   PROMPTS["maverick_r1"],   question),
    )
    save_and_stream(session, round=1, responses=round1)

    # ROUND 2: Each model sees all Round 1 responses
    r1_transcript = format_transcript(round1)
    r2_input = f"{question}\n\n--- ROUND 1 TRANSCRIPT ---\n{r1_transcript}"

    round2 = await asyncio.gather(
        call_model(models["analyst"]["id"],    PROMPTS["analyst_r2"],    r2_input),
        call_model(models["reasoner"]["id"],   PROMPTS["reasoner_r2"],   r2_input),
        call_model(models["challenger"]["id"], PROMPTS["challenger_r2"], r2_input),
        call_model(models["maverick"]["id"],   PROMPTS["maverick_r2"],   r2_input),
    )
    save_and_stream(session, round=2, responses=round2)

    # ROUND 3: Each model sees all Round 1 + Round 2 responses
    r2_transcript = format_transcript(round2)
    r3_input = f"{question}\n\n--- ROUND 1 ---\n{r1_transcript}\n\n--- ROUND 2 ---\n{r2_transcript}"

    round3 = await asyncio.gather(
        call_model(models["analyst"]["id"],    PROMPTS["analyst_r3"],    r3_input),
        call_model(models["reasoner"]["id"],   PROMPTS["reasoner_r3"],   r3_input),
        call_model(models["challenger"]["id"], PROMPTS["challenger_r3"], r3_input),
        call_model(models["maverick"]["id"],   PROMPTS["maverick_r3"],   r3_input),
    )
    save_and_stream(session, round=3, responses=round3)

    # VERDICT: Chairperson reads everything
    full_transcript = f"--- ROUND 1 ---\n{r1_transcript}\n\n--- ROUND 2 ---\n{r2_transcript}\n\n--- ROUND 3 ---\n{format_transcript(round3)}"
    verdict_input = f"{question}\n\n{full_transcript}"

    verdict = await call_model(chair_model, PROMPTS["chairperson"], verdict_input)
    save_and_stream(session, round=4, responses=[verdict])

    return session
```

---

## 8. System Prompts

### 8.1 Council Member Prompts

**GPT-5 — The Analyst**
```
You are "The Analyst" — a council member in a four-member deliberation.

Your approach: structured, data-driven, methodical.
- Lead with facts, statistics, and established frameworks
- Break complex questions into measurable components
- Cite specific examples, case studies, and research
- Present clear pros/cons with evidence

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Reasoner, The Challenger, The Maverick)
- When you disagree, say so clearly with evidence
- When another member makes a strong point, acknowledge it
- Do NOT hedge with "it depends" — commit to a position
- Keep responses focused and substantive (500-800 words in Round 1, shorter in later rounds)
```

**Claude Sonnet 4.6 — The Reasoner**
```
You are "The Reasoner" — a council member in a four-member deliberation.

Your approach: nuanced, considers edge cases, bridges perspectives.
- Explore deeper implications and second-order effects
- Consider who is affected and how — the human impact
- Find the nuance that others miss
- Bridge disagreements by finding common ground without sacrificing rigor

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Analyst, The Challenger, The Maverick)
- When you disagree, say so clearly with evidence
- When another member makes a strong point, acknowledge it
- Do NOT hedge with "it depends" — commit to a position
- Keep responses focused and substantive (500-800 words in Round 1, shorter in later rounds)
```

**Gemini 3.1 Pro — The Challenger**
```
You are "The Challenger" — a council member in a four-member deliberation.

Your approach: contrarian, stress-tests ideas, exposes weak reasoning.
- Question assumptions that others take for granted
- Bring counterexamples and real-world edge cases
- Play devil's advocate when there is too much agreement
- Challenge popular conclusions with unpopular but valid evidence

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Analyst, The Reasoner, The Maverick)
- When you disagree, say so clearly with evidence
- When another member makes a strong point, acknowledge it reluctantly — don't concede easily
- Do NOT hedge with "it depends" — commit to a position
- Keep responses focused and substantive (500-800 words in Round 1, shorter in later rounds)
```

**Grok 4 — The Maverick**
```
You are "The Maverick" — a council member in a four-member deliberation.

Your approach: unconventional, bold, cuts through noise.
- Bring fresh angles that no one else considers
- Challenge conventional wisdom and status quo thinking
- Willing to take controversial or unpopular positions if well-reasoned
- Use sharp, direct language — no corporate-speak or academic hedging
- Inject clarity by reframing the question when others are talking past each other

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Analyst, The Reasoner, The Challenger)
- When you disagree, say so directly — don't soften it
- When another member makes a genuinely strong point, acknowledge it
- Do NOT hedge with "it depends" — commit to a position
- Keep responses focused and substantive (500-800 words in Round 1, shorter in later rounds)
```

### 8.2 Round-Specific Prompt Additions

**Round 2 — Cross-Examination:**
```
ROUND 2 INSTRUCTIONS:
You have now read all four council members' opening statements.

In this round you MUST:
1. Directly address at least TWO other members by role name
2. Identify the strongest point made by another member and explain why it's strong
3. Challenge at least ONE claim you believe is wrong, weakly supported, or misleading
4. Refine your own position based on what you've learned — show how your thinking evolved
5. Do NOT simply summarize Round 1 — add NEW reasoning, evidence, or perspective

Format: Address other members directly. Example: "The Analyst claims X, but this overlooks..."
```

**Round 3 — Final Arguments:**
```
ROUND 3 INSTRUCTIONS:
This is your FINAL statement to the council. Two full rounds of debate have occurred.

In this round you MUST:
1. State your FINAL position clearly and decisively in the first paragraph
2. Acknowledge the strongest argument made against your position during the debate
3. Explain why you hold your position despite that counterargument (or why you changed your mind)
4. Identify areas of consensus — what do all or most members agree on?
5. Flag any irreconcilable disagreements with a clear "I disagree because..."

If the council has reached consensus: say so explicitly and state what was agreed.
If you changed your position during the debate: explain what persuaded you.
Keep this response concise (300-500 words). The debate is concluding.
```

### 8.3 Chairperson Prompt

```
You are the CHAIRPERSON of this council. You did NOT participate in the debate.
You are an independent, impartial judge reading the full transcript of a 3-round
deliberation between four council members: The Analyst, The Reasoner,
The Challenger, and The Maverick.

Your job is to produce the FINAL VERDICT in this exact structure:

## TL;DR
A clear, decisive answer in 2-3 sentences. This is the headline — make it count.

## Consensus
Bullet points of what all (or most) council members agreed on by the end.

## Key Debates
Where members disagreed and how those disagreements evolved across rounds.
Did anyone change their position? What arguments were most persuasive?

## Dissenting Views
Minority opinions that are worth preserving — even if most members disagreed,
was the dissent well-reasoned? State who dissented and why.

## Confidence
ONE of: HIGH, MEDIUM, or LOW
Then 1-2 sentences justifying this rating based on the degree of consensus
and the strength of evidence presented.

## Final Reasoning
The complete logic chain: what evidence was presented, what was contested,
what survived scrutiny, and how you weighed competing arguments to arrive
at the TL;DR.

RULES:
- Be DECISIVE. The whole point of a council is to reach a decision.
- Don't default to "it depends" — give a clear recommendation with conditions.
- Weight arguments by strength of reasoning and evidence, not by headcount.
- If the council reached genuine consensus, state it confidently.
- If there's an irreconcilable disagreement, explain both sides and state
  which you find more persuasive and WHY.
- Do not introduce new arguments or evidence — synthesize only what was debated.
- Refer to members by role name, never by model name.
```

---

## 9. Cost Analysis (Real OpenRouter Pricing)

### 9.1 Per-Session Cost: Frontier Tier

Token estimates per model per round (input + output):

| Component | Input Tokens | Output Tokens | Details |
|-----------|-------------|---------------|---------|
| **Round 1** (4 models parallel) | ~2K each = 8K total | ~1K each = 4K total | Question only as input |
| **Round 2** (4 models parallel) | ~6K each = 24K total | ~800 each = 3.2K total | Question + 4 Round 1 responses |
| **Round 3** (4 models parallel) | ~12K each = 48K total | ~600 each = 2.4K total | Question + Round 1 + Round 2 |
| **Verdict** (1 chairperson) | ~20K | ~1.5K | Full transcript |
| **Totals** | **~100K input** | **~11K output** | |

Cost breakdown by model:

| Model | Input Tokens | Output Tokens | Input Cost | Output Cost | Total |
|-------|-------------|---------------|------------|-------------|-------|
| GPT-5 | ~20K | ~2.4K | $0.025 | $0.024 | **$0.049** |
| Claude Sonnet 4.6 | ~20K | ~2.4K | $0.060 | $0.036 | **$0.096** |
| Gemini 3.1 Pro | ~20K | ~2.4K | $0.040 | $0.029 | **$0.069** |
| Grok 4 | ~20K | ~2.4K | $0.060 | $0.036 | **$0.096** |
| Claude Opus 4.6 (Chair) | ~20K | ~1.5K | $0.100 | $0.038 | **$0.138** |
| **Total per session** | | | | | **~$0.45** |

### 9.2 Per-Session Cost: Budget Tier

| Model | Input Cost | Output Cost | Total |
|-------|------------|-------------|-------|
| GPT-5 Mini | $0.005 | $0.005 | **$0.010** |
| Claude Haiku 4.5 | $0.020 | $0.012 | **$0.032** |
| Gemini 2.5 Flash | $0.006 | $0.006 | **$0.012** |
| Grok 4.1 Fast | $0.004 | $0.001 | **$0.005** |
| Claude Opus 4.5 (Chair) | $0.100 | $0.038 | **$0.138** |
| **Total per session** | | | **~$0.20** |

### 9.3 Pricing Model

| Tier | Price | Sessions/Month | Cost/Session | Margin |
|------|-------|----------------|-------------|--------|
| **Free** | $0 | 3/day (~90/mo) | Budget tier ($0.20) | -$18/mo (acquisition cost) |
| **Starter** | $9/month | 30/month | Frontier ($0.45) | ~$4.50 margin |
| **Pro** | $29/month | 150/month | Frontier ($0.45) | ~-$38.50 (subsidized) |
| **Business** | $79/month | 500/month | Mix frontier + budget | Break-even target |
| **API** | $0.75/session | Pay-as-you-go | Frontier ($0.45) | ~40% margin |

*Note: Costs are significantly lower than initial estimates because OpenRouter's pricing is competitive. The Chairperson (Opus) is the biggest single cost.*

---

## 10. Performance Requirements

| Metric | Target |
|--------|--------|
| Round 1 completion (4 parallel) | < 15 seconds |
| Round 2 completion (4 parallel) | < 20 seconds |
| Round 3 completion (4 parallel) | < 20 seconds |
| Verdict completion (1 model) | < 15 seconds |
| **Total session time** | **< 80 seconds** |
| First token to screen | < 2 seconds |
| Concurrent sessions supported | 50+ |
| API uptime | 99.5% (dependent on OpenRouter + providers) |
| Frontend TTFB | < 500ms |
| Lighthouse score | > 90 (performance) |

---

## 11. MVP Scope

### Phase 1: In Scope
- Single question/statement input
- 4-model, 3-round debate via OpenRouter
- Real-time SSE streaming of all rounds and verdict
- Chairperson verdict with structured output (TL;DR, consensus, debates, confidence)
- Session history stored in PostgreSQL
- Responsive web UI following Poster Modernist design system
- Copy verdict to clipboard
- Share session via public link
- Frontier and budget tier model selection

### Phase 1: Out of Scope (Future)
- User accounts and authentication
- Custom council composition (choose your own models)
- Follow-up questions within a session
- File/document upload for council analysis
- API access for developers
- Mobile app
- User voting/rating on verdicts
- Topic-specific councils (finance, legal, medical, etc.)
- Web search/citations by models (Perplexity-style)
- Model-vs-model leaderboard tracking

---

## 12. Success Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|--------|-------------------|-------------------|
| Daily active sessions | 100 | 1,000 |
| Session completion rate | > 90% | > 95% |
| Average session duration | < 80 sec | < 65 sec |
| User return rate (7-day) | > 30% | > 45% |
| Verdict quality (user thumbs up/down) | > 75% positive | > 82% positive |
| Average cost per session | < $0.50 | < $0.35 |
| Share rate (sessions shared) | > 5% | > 12% |

---

## 13. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenRouter rate limits | Sessions fail mid-debate | Implement exponential retry, queue system, per-model fallbacks |
| One provider goes down (e.g., xAI) | 3-member debate instead of 4 | Graceful degradation — proceed with available models, note absence |
| Models agree too readily | Boring debates, no differentiation | Strong role-specific prompts, Challenger and Maverick roles designed to push back |
| Context window overflow (Round 3) | Truncated input, degraded quality | Summarize prior rounds if transcript exceeds 80% of smallest context window |
| High Chairperson cost (Opus) | Unsustainable unit economics | Option to use Sonnet as chairperson for budget tier; cache common verdicts |
| Slow model responses | Users abandon before verdict | Streaming UI with progress indicators; set 60s timeout per model with fallback |
| Prompt injection via user question | Models break character or produce harmful output | Input validation, content filtering, rate limiting, safety system prompts |

---

## 14. Implementation Phases

### Phase 1: Core Engine (Week 1-2)
- Project setup: Next.js + FastAPI + Supabase
- OpenRouter integration with streaming
- Debate orchestrator (4 models, 3 rounds, verdict)
- SSE streaming endpoint
- Database schema and session persistence
- System prompts for all roles and rounds

### Phase 2: Web Frontend (Week 3-4)
- Design system implementation (Poster Modernist tokens, components)
- Home page with hero section and question input
- Council session page with streaming debate UI
- Verdict panel with structured display
- Navigation and responsive layout
- "How it works" and "Why different" sections

### Phase 3: Polish & Launch (Week 5-6)
- Error handling, retry logic, timeout fallbacks
- Progress indicators and loading states
- Share session via URL and copy verdict
- Session history page
- Performance optimization (SSR, caching, lazy loading)
- Deploy: Vercel (frontend) + Railway (backend) + Supabase (database)

### Phase 4: Growth Features (Post-launch)
- User accounts via Supabase Auth
- Usage limits and billing (Stripe)
- Budget vs frontier tier selection in UI
- API access for developers
- Custom council composition
- Follow-up questions
- Verdict rating/feedback system

---

## 15. Competitive Positioning

| Feature | Perplexity | ChatGPT | Gemini | Model Council |
|---------|-----------|---------|--------|---------------|
| Multi-model reasoning | No | No | No | **Yes (4 models)** |
| Transparent reasoning | Partial (citations) | No | No | **Yes (full debate visible)** |
| Cross-validation | No | No | No | **Yes (models check each other)** |
| Confidence indicator | No | No | No | **Yes (consensus-based)** |
| Bias detection | No | No | No | **Yes (disagreements surface bias)** |
| Web search/citations | **Yes** | Yes | Yes | No (Phase 1) |
| Speed | Fast (<5s) | Fast (<5s) | Fast (<5s) | Deliberate (~80s) |
| Cost to user | Free/Pro | Free/Pro | Free | Free/Pro |
| Provider diversity | Single model | Single model | Single model | **4 providers** |

**Unique value proposition:** No other product shows you AI reasoning from multiple competing models in a structured debate format. Model Council doesn't just give you an answer — it shows you *how* that answer was contested, refined, and validated across four independent AI systems.

---

## Appendix A: Example Session

**Question:** "Is remote work better for productivity than office work?"

**Round 1 — Opening Statements:**
- **The Analyst (GPT-5):** Cites Stanford study (13% productivity increase), Gallup data on engagement, breaks down by job type with specific metrics
- **The Reasoner (Claude):** Explores nuance — better for deep work, worse for spontaneous collaboration, depends on role seniority and team lifecycle stage
- **The Challenger (Gemini):** Challenges the premise — "productivity" is poorly defined, questions whether knowledge work can even be measured reliably
- **The Maverick (Grok):** Reframes entirely — the question is wrong; it's not remote vs office, it's about whether your company has earned the right to demand in-person time

**Round 2 — Cross-Examination:**
- **The Analyst:** "The Challenger raises a valid measurement concern, but the Stanford study controlled for this. However, I concede the data is from 2013..."
- **The Reasoner:** "I agree with The Analyst's data directionally but note the temporal gap. The Maverick's reframing is provocative but avoids answering the actual question..."
- **The Challenger:** "The Reasoner correctly identifies the temporal problem. I'll pivot: even 2024-2025 hybrid data shows productivity gains plateau after 2 remote days..."
- **The Maverick:** "The Reasoner accuses me of dodging — fair. My answer: remote work is better for productivity, but productivity is the wrong metric. The right metric is output quality."

**Round 3 — Final Arguments:**
- All four converge on: hybrid is likely optimal for most knowledge workers
- The Analyst commits to 3 remote days as the sweet spot based on aggregate data
- The Reasoner argues the split should be team-decided, not company-mandated
- The Challenger maintains measurement uncertainty means any specific ratio is premature
- The Maverick holds that the framing is wrong but concedes hybrid as a practical answer

**Verdict (Chairperson):**
- **TL;DR:** Hybrid remote work (2-3 remote days per week) improves measured productivity for most knowledge workers, but the optimal split should be decided at the team level based on role type, not imposed as a company-wide mandate.
- **Confidence:** HIGH — Strong consensus on hybrid; productive disagreements on implementation details only.

---

## Appendix B: Environment Variables

```env
# .env (never commit this file)
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```
