# 🚀 SAPAR ERP — Render.com Deployment Guide

Bu qoʻllanma orqali SAPAR ERP tizimini **Render.com** platformasiga avtomatlashtirilgan **Blueprint (`render.yaml`)** orqali 5 daqiqada toʻliq deploy qilishingiz mumkin.

---

## 🏗️ Arxitektura (Render Services)

Render dagi loyihamiz 3 ta asosiy qismdan iborat boʻladi:
1. **`sapar-db`** — Render Managed PostgreSQL 16 ma'lumotlar bazasi.
2. **`sapar-api`** — Node.js Express + Prisma ORM backend servisi.
3. **`sapar-frontend`** — React + TypeScript + Vite statik veb-ilovasi (SPA rewrite qoʻllab-quvvatlanadi).

---

## 📋 1-Qadam: Render.com ga kirish va GitHub Repo ulash

1. [https://dashboard.render.com](https://dashboard.render.com) ga kiring.
2. Yuqori oʻng burchakdagi **New +** tugmasini bosing va **Blueprint** ni tanlang.
3. GitHub hisobingiz orqali **`dostontech/SaparCoreApp`** reponi tanlang.
4. Branch sifatida **`main`** ni tanlang.

---

## ⚙️ 2-Qadam: Blueprint orqali avtomat sozlash

Render loyihaning ildizidagi `render.yaml` faylini avtomatik aniqlaydi va quyidagi resurslarni bir vaqtda yaratadi:

| Resurs | Turi | Build Command | Start Command |
| :--- | :--- | :--- | :--- |
| **`sapar-db`** | PostgreSQL | — | — |
| **`sapar-api`** | Web Service (Node) | `npm install && npx prisma generate && npx prisma db push && node seedDefaults.js` | `npm start` |
| **`sapar-frontend`** | Static Site (Vite) | `npm install && npm run build` | `dist` katalogi |

---

## 🔑 3-Qadam: Kerakli Muhit Oʻzgaruvchilari (Environment Variables)

`render.yaml` koʻp oʻzgaruvchilarni avtomat bogʻlaydi:
- `DATABASE_URL`: `sapar-db` bazasidan avtomat olinadi.
- `JWT_SECRET`: Render tomonidan xavfsiz avtomat generatsiya qilinadi.
- `VITE_API_BASE_URL`: `sapar-api` servisining jonli URL manzili avtomat beriladi.

---

## 👤 4-Qadam: Standart Kirish Ma'lumotlari (Demo Login)

Deploy muvaffaqiyatli yakunlangach, quyidagi hisoblar orqali tizimga kirishingiz mumkin:

- **Bosh Administrator (Rizobay Stroy)**:
  - **Email**: `stroy@sapar.uz` yoki `admin@demo.sapar.local`
  - **Parol**: `Demo123$`
- **Bosh Buxgalter**:
  - **Email**: `buxgalter@sapar.uz`
  - **Parol**: `Demo123$`

---

## 🔄 5-Qadam: Doimiy Avtomat Yangilanish (CI/CD)

Har safar `main` branchga yangi `git push origin main` qilganingizda, Render avtomatik ravishda yangi oʻzgarishlarni yuklab oladi va yangi versiyani deploy qiladi!
