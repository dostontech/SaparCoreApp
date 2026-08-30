# FSD — AI Features

**Module slug:** `ai`
**File:** `docs/fsd/ai.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The AI Features module provides AI-powered assistance throughout SAPAR:

- **Bill / Receipt OCR Extraction** — upload a supplier invoice image or PDF; AI extracts line items, supplier info, totals, tax amounts, and pre-fills the purchase/expense form
- **Financial Co-Pilot Chat** — conversational AI assistant answering accounting questions, generating reports, and navigating the system
- **AI Usage & Cost Tracking** — per-call token usage logging and cost estimation for budget management
- **BYOK (Bring Your Own Key)** — configurable AI providers: Claude (Anthropic) or OpenAI GPT-4o
- **Conversation context** — multi-turn AI chat sessions tied to a user

**Regional scope:** AI prompts are multilingual (Uzbek/Russian/English). The AI is prompted with SAPAR/Uzbekistan accounting context (Uzbek chart of accounts, QQS tax codes, MXIK codes).

---

## 2. Data Model

### 2.1 AiConfig (per-tenant AI settings)

```prisma
model AiConfig {
  id             String         @id @default(uuid())
  userId         String         @unique  // one config per tenant
  provider       AiProviderKind // ANTHROPIC | OPENAI | NONE
  encryptedApiKey String?       // encrypted at rest
  selectedModel  String?        // e.g. "claude-3-5-sonnet-20241022"
  maxMonthlyUsd  Decimal?       @db.Decimal(10,2)  // spend cap
  isEnabled      Boolean        @default(false)
}
```

### 2.2 AiExtractionJob (Bill OCR)

```prisma
model AiExtractionJob {
  id            String             @id @default(uuid())
  userId        String
  sourceType    String             // EXPENSE | PURCHASE
  inputImageUrl String?
  inputRawText  String?
  status        AiExtractionStatus // PENDING | PROCESSING | DONE | FAILED
  result        Json?              // extracted structured data
  errorMessage  String?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
}
```

### 2.3 AiChatSession + AiChatMessage

```prisma
model AiChatSession {
  id        String          @id
  userId    String
  title     String?         // auto-generated from first message
  messages  AiChatMessage[]
  isDeleted Boolean         @default(false)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model AiChatMessage {
  id         String      @id
  sessionId  String
  role       AiChatRole  // USER | ASSISTANT | TOOL
  content    String      @db.Text
  toolName   String?     // name of tool called (if role=TOOL)
  toolInput  Json?
  toolResult Json?
  costUsd    Decimal?    @db.Decimal(10,6)  // per-message cost
  createdAt  DateTime    @default(now())
}
```

### 2.4 AiUsageLog (Cost Tracking)

```prisma
model AiUsageLog {
  id           String         @id
  userId       String
  feature      String         // "bill_extraction" | "copilot_chat" | ...
  provider     AiProviderKind
  model        String?
  inputTokens  Int?
  outputTokens Int?
  costUsd      Decimal?       @db.Decimal(10,6)
  createdAt    DateTime       @default(now())
}
```

### 2.5 Enums

```prisma
enum AiProviderKind { ANTHROPIC OPENAI NONE }
enum AiChatRole { USER ASSISTANT TOOL }
enum AiExtractionStatus { PENDING PROCESSING DONE FAILED }
```

---

## 3. Backend

### 3.1 API Endpoints

#### AI Config

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/ai/config` | `aiConfigController.ts::getConfig` |
| `PUT` | `/admin/ai/config` | `aiConfigController.ts::upsertConfig` |
| `DELETE` | `/admin/ai/config/api-key` | `aiConfigController.ts::clearApiKey` |
| `POST` | `/admin/ai/config/test` | `aiConfigController.ts::testConnection` |

#### Bill OCR Extraction

| Method | Path | Controller |
|--------|------|-----------|
| `POST` | `/admin/ai/extract` | `aiExtractionController.ts::extractBill` |
| `GET` | `/admin/ai/extract/:jobId` | `aiExtractionController.ts::getJobStatus` |

#### Co-Pilot Chat

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/ai/chat/sessions` | `aiChatController.ts::listSessions` |
| `POST` | `/admin/ai/chat/sessions` | `aiChatController.ts::createSession` |
| `GET` | `/admin/ai/chat/sessions/:id` | `aiChatController.ts::getSession` |
| `POST` | `/admin/ai/chat/sessions/:id/messages` | `aiChatController.ts::sendMessage` |
| `DELETE` | `/admin/ai/chat/sessions/:id` | `aiChatController.ts::deleteSession` |

#### Usage & Costs

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/ai/usage` | `aiUsageController.ts::getUsageSummary` |
| `GET` | `/admin/ai/usage/chart` | `aiUsageController.ts::getUsageChart` |

### 3.2 Business Logic

**Bill OCR (`extractBill`):**
1. Client uploads image/PDF base64 to `POST /admin/ai/extract`
2. System creates `AiExtractionJob{status: PENDING}`
3. Background processing:
   - If `provider = ANTHROPIC`: calls Anthropic Vision API with a structured extraction prompt
   - If `provider = OPENAI`: calls GPT-4o Vision API
4. Prompt instructs AI to extract:
   - Supplier name, STIR (TIN), address
   - Invoice number, date, due date
   - Line items: `{name, catalogCode (MXIK if visible), quantity, unit, unitPrice, vatRate, total}`
   - Totals: subtotal, VAT amount, grand total
5. Result stored in `AiExtractionJob.result` as JSON; `status → DONE`
6. Frontend polls `GET /admin/ai/extract/:jobId` until DONE, then pre-fills form

**Co-Pilot Chat (`sendMessage`):**
1. User sends message to an `AiChatSession`
2. Full message history for the session is assembled
3. System prompt injected:
   - "You are SAPAR Financial Co-Pilot, an expert in Uzbekistan accounting (QQS 12%, JShODS 12%, INPS 0.1%, BHMS chart of accounts). Answer in {user's language}."
4. Sent to AI provider (Claude Sonnet or GPT-4o) with tool definitions for SAPAR actions
5. AI may call tools: `getBalanceSheet`, `getProfitLoss`, `listInvoices`, `getContactBalance`, etc.
6. Tool results injected back into conversation
7. Final assistant message saved to `AiChatMessage`, `costUsd` recorded
8. `AiUsageLog` entry created

**Usage cost tracking:**
Per-call cost estimated from provider pricing:
- Anthropic Claude: `inputTokens × $3/1M + outputTokens × $15/1M`
- OpenAI GPT-4o: `inputTokens × $5/1M + outputTokens × $15/1M`

Monthly cap check: Before each API call, sum `AiUsageLog.costUsd` for current month. If `>= AiConfig.maxMonthlyUsd` → reject with 429.

**API key encryption:**
`encryptedApiKey` is stored AES-256 encrypted. The encryption key is derived from `process.env.AI_ENCRYPTION_SECRET`.

### 3.3 Validation Rules

- `AiConfig.provider` must be ANTHROPIC, OPENAI, or NONE
- `maxMonthlyUsd` must be `> 0` if set
- `extractBill` requires AI config `isEnabled = true` with valid API key
- Chat sessions require `isEnabled = true`
- `AiChatMessage.content` must be non-empty
- Session `isDeleted = true` → no new messages can be sent

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| AI Settings | `pages/admin/ai/AiSettingsPage.tsx` | `/admin/settings/ai` |
| AI Co-Pilot Chat | `pages/admin/ai/AiCopilotPage.tsx` | `/admin/ai/copilot` |
| AI Usage Report | `pages/admin/ai/AiUsagePage.tsx` | `/admin/ai/usage` |

### 4.2 User Flows

**Configure AI Provider:**
1. Settings → AI → Select provider (Claude / OpenAI)
2. Enter API key → stored encrypted
3. Select model (e.g., claude-3-5-sonnet-20241022, gpt-4o)
4. Set monthly spend cap in USD
5. "Test ulanishi" → validates key with a minimal API call
6. Enable AI features toggle

**Bill OCR Extraction:**
1. Create Expense or Purchase → "Skaner qilish" (Scan Receipt) button
2. Upload or capture photo of supplier invoice/receipt
3. `POST /admin/ai/extract` → job created
4. Spinner shown; frontend polls until `status = DONE`
5. Extracted data pre-fills form fields (supplier, date, line items, VAT)
6. User reviews and edits if needed → saves normally

**AI Co-Pilot Chat:**
1. Navigate to AI Co-Pilot (sidebar icon or `/admin/ai/copilot`)
2. Chat window with SAPAR logo avatar for AI responses
3. Type question: "Joriy oyning sof foydasi qancha?" (What is the net profit for the current month?)
4. AI calls `getProfitLoss` tool → returns P&L data → responds in Uzbek: "Joriy oy uchun sof foyda: 48,500,000 soʻm"
5. Conversation history persisted in `AiChatSession`
6. New session button creates a fresh chat thread

### 4.3 Key Components

- `AiSettingsPage.tsx` (15 KB): Provider selector cards, API key input (masked), model picker, monthly cap input, test connection button.
- `AiCopilotPage.tsx` (22 KB): Chat interface with message bubbles (user/assistant/tool-call), streaming response indicator, session history sidebar, new session button.
- `AiUsagePage.tsx` (12 KB): Bar chart of daily token usage and USD cost, running monthly total, per-feature breakdown table.

---

## 5. Integrations

- **Expense form:** OCR result pre-fills `ExpenseFormModal.tsx`
- **Purchase form:** OCR result pre-fills `CreatePurchase.tsx`
- **All SAPAR data:** Co-Pilot chat tools access GL, invoices, contacts, bank balances via internal controller functions (no separate API calls — called as functions within the chat handler)
- **Anthropic API:** `https://api.anthropic.com/v1/messages`
- **OpenAI API:** `https://api.openai.com/v1/chat/completions`

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Co-Pilot tool definitions not visible** | 🟡 Medium | The AI chat controller tool schemas (functions the AI can call) are defined internally but not documented. Tool coverage and parameter schemas need review. |
| 2 | **No streaming responses** | 🟡 Medium | AI chat uses blocking request-response. For long AI responses, the user sees a spinner for several seconds. Streaming (SSE/WebSocket) should be implemented. |
| 3 | **AiExtractionJob not cleaned up** | 🟢 Low | Failed/old extraction jobs accumulate in the database. No retention policy or cleanup job. |
| 4 | **MXIK code extraction unreliable** | 🟡 Medium | AI may hallucinate MXIK codes from bill images. No validation of extracted MXIK against the national product classifier. |
| 5 | **Monthly cap check has race condition** | 🟡 Medium | Under concurrent requests, two simultaneous calls could both pass the cap check before either logs their cost. Needs atomic decrement or a distributed counter. |
| 6 | **No Uzbek-language AI model** | 🟢 Low | Claude and GPT-4o understand Uzbek but are not fine-tuned for Uzbekistan accounting. A local Uzbek LLM (e.g., via Hugging Face) could be more accurate for domain-specific queries. |
