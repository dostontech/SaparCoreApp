# 🚀 SAPAR ERP — Render.com Deployment Guide & Checklist

This guide provides the complete blueprint and step-by-step instructions to deploy **SAPAR ERP** on **[Render.com](https://render.com)**.

---

## 📋 Comprehensive Render Deployment Checklist

### Pre-Deployment Checklist
- [x] Sensitive files (`.env`, `*.pfx`, `*.pem`, `backups/`) added to `.gitignore`.
- [x] `render.yaml` Blueprint created at repository root.
- [x] Backend `server.js` configured with automated Prisma migration & baseline seeding on startup.
- [x] SPA client-side routing rewrite rule configured (`/*` → `/index.html`).
- [x] Uzbekistan default currency (`UZS`), tax profiles (`QQS 12%`, `JShODS 12%`), and BHMS 21 accounting verified.

---

## 🛠️ Method 1: 1-Click Blueprint Deployment (Recommended)

1. **Push your code to GitHub / GitLab**.
2. Log in to your **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** → **Blueprint**.
4. Select your **SAPAR** repository.
5. Render will automatically parse `render.yaml` and provision:
   * **`sapar-postgres`** (PostgreSQL 16 Managed Database)
   * **`sapar-api`** (Backend Web Service)
   * **`sapar-frontend`** (React Vite Static Site with SPA redirects)
6. Click **Apply**.
7. Wait 2–3 minutes for deployment to finish!

---

## ⚙️ Method 2: Manual Dashboard Setup

If you prefer to configure each service manually in the Render dashboard:

### Step 1: Create PostgreSQL Database
1. Go to **New +** → **PostgreSQL**.
2. Name: `sapar-postgres`
3. Database: `sapar`
4. User: `sapar`
5. Region: `Frankfurt (EU Central)` *(closest low latency to Uzbekistan)*
6. PostgreSQL Version: `16`
7. Click **Create Database**.
8. Copy the **Internal Database URL** (e.g. `postgresql://sapar:...@sapar-postgres:5432/sapar`).

---

### Step 2: Create Backend Web Service
1. Go to **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   * **Name**: `sapar-api`
   * **Root Directory**: `SaparCore/sapar-typescript-backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npx prisma generate`
   * **Start Command**: `node server.js`
   * **Health Check Path**: `/api/healthz`
4. Add **Environment Variables**:

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `3001` | Backend port |
| `DATABASE_URL` | *Paste Internal Database URL from Step 1* | Database connection |
| `JWT_SECRET` | *Click "Generate" or paste 32-hex string* | JWT token signing key |
| `AI_ENCRYPTION_KEY` | *Click "Generate" or paste 32-hex string* | AES-256 key encryption |
| `CORS_ORIGIN` | `*` (or your frontend URL) | Allowed origins |
| `SEED_ON_BOOT` | `true` | Auto-seeds default lookups on first run |

5. Click **Create Web Service**.
6. Copy your backend live URL (e.g., `https://sapar-api.onrender.com`).

---

### Step 3: Create Frontend Static Site
1. Go to **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure settings:
   * **Name**: `sapar-frontend`
   * **Root Directory**: `SaparCore/sapar-typescript-frontend`
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `dist`
4. Add **Environment Variables**:

| Variable | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://sapar-api.onrender.com` | Live backend API URL |
| `VITE_DEMO_MODE` | `false` | Disable demo mode banners |

5. Add **Redirects/Rewrites Rule** (for React Router):
   * **Type**: `Rewrite`
   * **Source**: `/*`
   * **Destination**: `/index.html`
6. Click **Create Static Site**.

---

## ✅ Post-Deployment Verification Checklist

Once Render finishes deploying:

1. **Verify Backend Health**:
   * Open `https://sapar-api.onrender.com/api/healthz` in your browser.
   * Expected response: `{"status":"ok","timestamp":"..."}`.
2. **First Admin Registration**:
   * Open `https://sapar-frontend.onrender.com/register`.
   * Create your Master Administrator account.
3. **Verify Uzbekistan Modules**:
   * Navigate to `/accounting/chart-of-accounts` (BHMS 21 accounts).
   * Navigate to `/accounting/reports/soliq-qqs` (Soliq QQS 12% Form 10006_29).
   * Navigate to `/pos` (Touchscreen POS terminal with Uzcard/Humo/Cash).
4. **Attach Custom Domain (Optional)**:
   * Go to Render Static Site → **Custom Domains** → add `app.sapar.uz`.
   * Add CNAME record pointing to Render.
