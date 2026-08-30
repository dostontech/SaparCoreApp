# 📚 SAPAR ERP — To'liq REST API Qo'llanmasi (API Reference)

**Tizim Versiyasi**: `v2.4.0` (Oʻzbekiston & Markaziy Osiyo standarti)  
**Asosiy API Serveri**: `http://localhost:8080/api` (Production: `https://api.sapar.uz/api`)  
**Format**: `application/json`  
**Autentifikatsiya**: `Authorization: Bearer <JWT_TOKEN>`

---

## 📑 Mundarija (Modullar Bo'yicha)

1. [Autentifikatsiya & Foydalanuvchilar (`/api/auth`)](#1-autentifikatsiya--foydalanuvchilar)
2. [Boshqaruv Paneli & Tizim Sozlamalari (`/api/admin/dashboard`)](#2-boshqaruv-paneli--tizim-sozlamalari)
3. [Mijozlar & Kontragentlar (`/api/admin/contacts`)](#3-mijozlar--kontragentlar)
4. [Sotuvlar, Hisob-Fakturalar va TTN (`/api/admin/invoices`)](#4-sotuvlar-hisob-fakturalar-va-ttn)
5. [Mahsulotlar Katalogi & 17-Xonali MXIK (`/api/admin/products`)](#5-mahsulotlar-katalogi--17-xonali-mxik)
6. [Ko'p Omborli Zaxira & Ko'chirishlar (`/api/admin/inventory`)](#6-kop-omborli-zaxira--kochirshlar)
7. [Xaridlar & Ta'minotchilar (`/api/admin/purchases`)](#7-xaridlar--taminotchilar)
8. [Kassa, Bank & Valyuta (`/api/admin/finance`)](#8-kassa-bank--valyuta)
9. [POS Kassa Terminali (`/api/admin/pos`)](#9-pos-kassa-terminali)
10. [21-Son BHMS Davlat Buxgalteriyasi (`/api/admin/accounting/bhms`)](#10-21-son-bhms-davlat-buxgalteriyasi)
11. [Davlat Soliq Qo'mitasi Deklaratsiyalari (`/api/admin/accounting/reports/soliq-*`)](#11-davlat-soliq-qomitasi-deklaratsiyalari)
12. [E-IMZO & Didox E-Faktura (`/api/admin/eimzo` & `/api/admin/e-documents`)](#12-e-imzo--didox-e-faktura)
13. [Ish Haqi & Tabel HRM (`/api/admin/payroll`)](#13-ish-haqi--tabel-hrm)
14. [Payme, Click & Uzum To'lov Shlyuzlari (`/api/admin/gateways`)](#14-payme-click--uzum-tolov-shlyuzlari)

---

## 1. Autentifikatsiya & Foydalanuvchilar

### `POST /api/auth/register`
Yangi korxona adminini ro'yxatdan o'tkazish.
```json
// Request
{
  "firstName": "Farhod",
  "lastName": "Rahimov",
  "email": "stroy@sapar.uz",
  "phone": "+998901234567",
  "password": "strongPassword123",
  "companyName": "RIZOBAY STROY OOO"
}
```

### `POST /api/auth/login`
Tizimga kirish va JWT tokenni olish.
```json
// Request
{
  "email": "stroy@sapar.uz",
  "password": "strongPassword123"
}

// Response (200 OK)
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5b22e867-952d-4050-80f6-6dfcfd3923e7",
    "firstName": "Farhod",
    "email": "stroy@sapar.uz",
    "user_type": 1,
    "roleId": "admin-role-id"
  }
}
```

---

## 2. Boshqaruv Paneli & Tizim Sozlamalari

### `GET /api/admin/dashboard`
Boshqaruv panelining umumiy metrikalari.
```json
// Response (200 OK)
{
  "totalIncome": 485000000,
  "totalExpense": 192000000,
  "netProfit": 293000000,
  "receivablesTotal": 125000000,
  "payablesTotal": 48500000,
  "cashInHand": 84500000,
  "bankBalance": 412000000
}
```

### `GET /api/admin/system-settings`
Korxona nomi, STIR/INN raqami, asosiy valyuta (UZS) va aloqa ma'lumotlari.

---

## 3. Mijozlar & Kontragentlar

### `GET /api/admin/contacts`
* Query Parametrlar: `?type=customer|vendor&search=toshkent`
```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": "c-1001",
      "name": "OOO \"TOSHKENT MEGA SAVDO\"",
      "type": "customer",
      "taxId": "309485721",
      "phone": "+998712001122",
      "balance": 125000000,
      "currency": "UZS"
    }
  ]
}
```

### `GET /api/admin/contacts/:id/statement`
Solishtirma dalolatnoma (Akt sverki ko'chirmasi).

---

## 4. Sotuvlar, Hisob-Fakturalar va TTN

### `GET /api/admin/invoices/next-number`
Keyingi hisob-faktura raqami (masalan: `INV-2026/001`).

### `POST /api/admin/invoices`
Yangi sotuv hisob-fakturasini shakllantirish.
```json
// Request
{
  "invoiceNumber": "INV-2026/001",
  "contactId": "c-1001",
  "invoiceDate": "2026-08-29",
  "dueDate": "2026-09-15",
  "warehouseId": "w-01",
  "items": [
    {
      "productId": "p-101",
      "quantity": 50,
      "unitPrice": 120000,
      "taxRate": 12,
      "ikpuCode": "06902001001000000"
    }
  ]
}
```

---

## 5. Mahsulotlar Katalogi & 17-Xonali MXIK

### `GET /api/admin/productsrecent`
Dropdown va qidiruv uchun tovarlar ro'yxati.

### `POST /api/admin/products`
Yangi mahsulot kiritish.
```json
// Request
{
  "name": "Armatura A500C d-12mm",
  "sku": "ARM-12",
  "barcode": "4780012345678",
  "unitId": "unit-tn",
  "ikpuCode": "02401001001000000",
  "purchasePrice": 8500000,
  "sellingPrice": 9800000,
  "taxRate": 12,
  "currency": "UZS"
}
```

---

## 6. Ko'p Omborli Zaxira & Ko'chirishlar

- `GET /api/admin/warehouse` — Omborlar ro'yxati.
- `POST /api/admin/inventory/transfer` — Ombordan omborga ko'chirish.
- `POST /api/admin/inventory/adjustment` — Kamomad / Ortiqchalikni hisobdan chiqarish (`9430`).

---

## 7. Xaridlar & Ta'minotchilar

- `GET /api/admin/purchases` — Xarid fakturalari ro'yxati.
- `POST /api/admin/purchases` — Xaridni rasmiylashtirish va 12% kiruvchi QQS hisobga olish.
- `GET /api/admin/purchase-orders` — Ta'minotchi buyurtmalari.

---

## 8. Kassa, Bank & Valyuta

- `GET /api/admin/accounts` — Bank hisob raqamlari (Ipak Yoʻli, Kapitalbank va b.).
- `GET /api/admin/petty-cash` — Milliy kassa (`5010`) qoldig'i.
- `POST /api/admin/expenses` — Operatsion xarajat chiqimi va chek yuklash.

---

## 9. POS Kassa Terminali

- `POST /api/admin/pos/sale` — POS orqali tezkor chek urish (Naqd + Humo/Uzcard + Nasiya).
- `POST /api/admin/pos/shifts/open` — Smena ochish.
- `POST /api/admin/pos/shifts/close` — Smena yopish va Z-Hisobot chiqarish.

---

## 10. 21-Son BHMS Davlat Buxgalteriyasi

- `GET /api/admin/accounting/bhms/oborotka-trial-balance` — Aylanma vedomost (Oborotka).
- `GET /api/admin/accounting/bhms/form1-balance-sheet` — **1-Shakl (Buxgalteriya balansi)**.
- `GET /api/admin/accounting/bhms/form2-profit-loss` — **2-Shakl (Moliyaviy natijalar to'g'risida hisobot)**.
- `POST /api/admin/accounting/journal-entries` — Bosh kitob provodkasi.

---

## 11. Davlat Soliq Qo'mitasi Deklaratsiyalari

- `GET /api/admin/accounting/reports/soliq-qqs` — QQS 12% Oylik deklaratsiyasi (Form 10006_29).
- `GET /api/admin/accounting/reports/soliq-jshods` — JShODS (12%) va Ijtimoiy soliq (12%) hisoboti (Form 11101_14).
- `GET /api/admin/accounting/reports/soliq-aylanma` — Aylanmadan olinadigan soliq (4%) hisoboti (Form 10104_18).

---

## 12. E-IMZO & Didox E-Faktura

- `POST /api/admin/eimzo/sign-document` — E-IMZO PKCS#7 raqamli imzo qo'yish.
- `POST /api/admin/e-documents/send-didox` — Didox.uz EDI tizimiga e-faktura yuborish.
- `GET /api/admin/e-documents/status/:documentId` — Imzolanish holatini tekshirish.

---

## 13. Ish Haqi & Tabel HRM

- `POST /api/admin/payroll/calculate` — Oylik maoshni hisoblash (JShODS 12%, Ijtimoiy soliq 12%, INPS 0.1%).
- `GET /api/admin/tabel/attendance` — Oylik tabel davomati.

---

## 14. Payme, Click & Uzum To'lov Shlyuzlari

- `POST /api/admin/gateways/payme/generate-link` — Payme QR/to'lov havolasi.
- `POST /api/admin/gateways/click/generate-link` — Click to'lov havolasi.
- `POST /api/admin/gateways/uzum/generate-link` — Uzum Pay to'lov havolasi.
