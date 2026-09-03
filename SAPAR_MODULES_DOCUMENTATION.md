# 📚 SAPAR ERP — Toʻliq Modullar Qoʻllanmasi va Texnik Hujjatlar
*(Comprehensive System & Module Documentation)*

**Loyiha**: SAPAR ERP & POS Core Engine  
**Mintaqaviy Standart**: Oʻzbekiston va Markaziy Osiyo  
**Asosiy Valyuta**: UZS (soʻm), Koʻp valyutali rejim (USD, EUR, RUB)  
**Texnologiyalar**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Redux Toolkit + Node.js/Express + Prisma ORM + PostgreSQL + Docker  

---

## 📑 Mundarija (Table of Contents)

1. [Arxitektura va Global Standartlar](#1-arxitektura-va-global-standartlar)
2. [1-Modul: CRM & Mijozlar / Taʼminotchilar Boshqaruvi](#2-1-modul-crm--mijozlar--taminotchilar-boshqaruvi)
3. [2-Modul: Mahsulotlar, Xizmatlar & Katalog](#3-2-modul-mahsulotlar-xizmatlar--katalog)
4. [3-Modul: Savdo, Hisob-fakturalar & Yetkazib Berish (TTN)](#4-3-modul-savdo-hisob-fakturalar--yetkazib-berish-ttn)
5. [4-Modul: Xaridlar & Taʼminot Zanjiri](#5-4-modul-xaridlar--taminot-zanjiri)
6. [5-Modul: POS Kassa Terminali & Kassirlar Boshqaruvi](#6-5-modul-pos-kassa-terminali--kassirlar-boshqaruvi)
7. [6-Modul: Omborxona & Inventarizatsiya](#7-6-modul-omborxona--inventarizatsiya)
8. [7-Modul: Moliya, Bank & Buxgalteriya (21-BHMS)](#8-7-modul-moliya-bank--buxgalteriya-21-bhms)
9. [8-Modul: HRM & Ish Haqi (Payroll)](#9-8-modul-hrm--ish-haqi-payroll)
10. [9-Modul: Moliyalashtirish Markazi & Kredit Skoring](#10-9-modul-moliyalashtirish-markazi--kredit-skoring)
11. [10-Modul: E-IMZO, Didox & Davlat Soliq Integratsiyalari](#11-10-modul-e-imzo-didox--davlat-soliq-integratsiyalari)
12. [Administrator Sozlamalari, Filiallar & Xavfsizlik](#12-administrator-sozlamalari-filiallar--xavfsizlik)

---

## 1. Arxitektura va Global Standartlar

SAPAR tizimi Oʻzbekiston Respublikasi Soliq Qoʻmitasi (DSQ), Markaziy Bank va Adliya Vazirligi standartlariga 100% moslashtirilgan boʻlib, barcha xorijiy tizimlar (Hindiston GST, Buyuk Britaniya MTD, AQSH savdo soliqlari) toʻliq chiqarib tashlangan.

### Standart Rejimlar:
- **Soliq Rejimi**:
  - QQS (НДС) — `12%` standart stavka.
  - QQS `0%` — Eksport tovarlari va xalqaro tashishlar.
  - Soliqsiz / Imtiyozli (Без НДС) — Qonunchilikka asosan soliqdan ozod operatsiyalar.
  - Aylanmadan olinadigan soliq (Turnover Tax) — `4%` (soddalashtirilgan tartib).
- **Yuridik Identifikatorlar**:
  - **STIR / ИНН**: 9 xonali yuridik shaxs soliq identifikatsiya raqami.
  - **JShShIR / ПИНФЛ**: 14 xonali jismoniy shaxs / YaTT shaxsiy kodi.
  - **MXIK / IKPU**: 17 xonali Oʻzbekiston yagona elektron tovarlar va xizmatlar tasniflagich kodi (Tasnif Soliq).
  - **Bank H/R**: 20 xonali milliy hisob-raqam (masalan, `20208000900123456001`).
  - **Bank MFO**: 5 xonali bank kodi (masalan, `00440` — Ipak Yoʻli Banki, `00973` — Kapitalbank).

---

## 2. 1-Modul: CRM & Mijozlar / Taʼminotchilar Boshqaruvi

### Asosiy Vazifalari:
Yuridik va jismoniy shaxs boʻlgan mijozlar, doimiy xaridorlar va yetkazib beruvchilarning toʻliq maʼlumotlar bazasini yuritish.

### Tarkibiy Qismlar va Fayllar:
- **`ContactForm.tsx` & `ContactCard.tsx`**:
  - Yuridik shaxs (Kompaniya) yoki Jismoniy shaxs (Individual / YaTT) turi.
  - **STIR / ИНН (9 xonali)** va **JShShIR (14 xonali)** milliy maydonlari.
  - Bank rekvizitlari: 20 xonali H/R, 5 xonali MFO, Bank nomi, Shartnoma raqami va sanasi.
  - Yetkazib berish manzili va yuridik manzillar (14 ta Oʻzbekiston viloyati va Toshkent shahri).
- **Bitimlar Quvuri (Sales Pipeline / CRM Kanban)**:
  - Bosqichlar: `Yangi lid` ➔ `Muzokara` ➔ `Taklif yuborildi` ➔ `Toʻlov kutilmoqda` ➔ `Yopildi (Yutuq)`.
- **Akt Sverki (Solishtirma Dalolatnoma)**:
  - Tanlangan davr boʻyicha hisob-fakturalar va toʻlov topshiriqnomalari harakatini solishtirib, debitorlik/kreditorlik saldo hisobotini shakllantirish va ikki tomonlama muhr/imzo bilan PDF chiqarish.

---

## 3. 2-Modul: Mahsulotlar, Xizmatlar & Katalog

### Asosiy Vazifalari:
Barcha tovarlar, materiallar, xizmatlar va qadoqlarni hisobga olish, shtrix-kodlar generatsiyasi va narx yorliqlarini chop etish.

### Asosiy Imkoniyatlar:
1. **Tovar Turi Selektori (Bukku Uslubi)**:
   - `[ 📦 Tovar / Mahsulot ]`: Ombor zaxirasi yuritiladi, qoldiqlar kirim/chiqim boʻyicha nazorat qilinadi.
   - `[ 🛠️ Xizmat / Servis ]`: Zaxirasiz, toʻgʻridan-toʻgʻri daromad hisobvaragʻiga oʻtadi.
2. **Oʻzbekiston GS1 EAN-13 Shtrix-kod Generatori (`productGenerators.ts`)**:
   - `[ EAN-13 Avto ]` tugmasi bosilganda Oʻzbekiston milliy prefiksi `478...` va Modulo-10 matematik nazorat raqamiga ega rasmiy 13 xonali shtrix-kod generatsiya qilinadi.
3. **Kategoriyalar uchun iBox Sensorli Rang va Ikonka Tanlagich (`CreateCategoryModal.tsx`)**:
   - 8 xil zamonaviy rang palitrasi (*Teal, Mint, Navy, Amber, Blue, Purple, Emerald, Rose*).
   - 11 xil savdo piktogrammasi (*Package, ShoppingBag, Wrench, Sparkles, Building2, Layers, Utensils, Zap, Shirt, Coffee, Tag*).
4. **Soliq Oʻlchov Birliklari (`CreateUnitModal.tsx`)**:
   - Oʻzbekiston standart birliklari: `dona (796)`, `kg (166)`, `metr (006)`, `litr (112)`, `qop (796)`, `m² (055)`, `m³ (113)`, `t (163)`.
5. **Shtrix-kodli Narx Yorliqlari (Tsennik) Modali (`BarcodeLabelPrintModal.tsx`)**:
   - Termo-printerlar uchun 3 xil oʻlcham: `30×20 mm`, `40×25 mm`, `58×40 mm`.
   - Jonli stiker koʻrinishi, nusxalar soni, soʻmdagi narx va korxona nomi bilan toʻgʻridan-toʻgʻri termo-printerga chop etish.
6. **Tezkor Mahsulot Qoʻshish (`QuickAddProductModal.tsx`)**:
   - POS yoki Sotuv sahifasidan chiqmasdan 10 soniyada yangi tovar kiritish va uni darhol ochilgan savatga qoʻshish.

---

## 4. 3-Modul: Savdo, Hisob-fakturalar & Yetkazib Berish (TTN)

### Asosiy Vazifalari:
B2B va B2C savdo shartnomalari, schyot-fakturalar, tijorat takliflari va yukxatlarni qonuniy rasmiylashtirish.

### Asosiy Imkoniyatlar:
- **Elektron Hisob-fakturalar (`CreateInvoice.tsx`, `EditInvoice.tsx`)**:
  - 17 xonali Soliq MXIK / IKPU kodi, tovar qadoq kodi va QQS 12% hisobi.
  - Mijoz rekvizitlarida toʻliq **STIR / ИНН**, bank MFO va hisob-raqamlari aks etadi.
- **Bosma Shablonlar (`InvoiceTemplateA`, `InvoiceTemplateB`, `InvoiceTemplateA5Landscape`)**:
  - A4 vertikal, A4 gorizontal va A5 ixcham formatlardagi Oʻzbekiston standart schyot-faktura blankalari.
- **TTN (Tovarni Yetkazib Berish Yukxati — Nakladnaya)**:
  - Yuk joʻnatuvchi, yuk qabul qiluvchi, avtomobil davlat raqami, haydovchi F.I.Sh. va ishonchnoma (doverennost) rekvizitlari bilan rasmiy blanka.
- **Tijorat Takliflari (Quotations)** va **Qaytarishlar (Credit Notes)**.

---

## 5. 4-Modul: Xaridlar & Taʼminot Zanjiri

### Asosiy Vazifalari:
Yetkazib beruvchilardan xom-ashyo va tayyor mahsulotlar xaridi, buyurtmalar, kirim fakturalari va qarzdorlik hisoboti.

### Asosiy Imkoniyatlar:
- **Xarid Buyurtmalari (Purchase Orders)**:
  - Taʼminotchiga buyurtma berish, narxlarni muvofiqlashtirish va yetkazish muddatlarini belgilash.
- **Xarid Fakturalari (Purchase Invoices)**:
  - Ombordagi qoldiqlarni toʻgʻridan-toʻgʻri kirim qilish, tannarxni hisoblash va taʼminotchi oldidagi kreditorlik qarzini qayd etish.
- **Debet-Notlar (Xarid Qaytaruvlari)**:
  - Yaroqsiz yoki shartnomaga mos kelmagan tovarlarni taʼminotchiga qaytarish dalolatnomasi.

---

## 6. 5-Modul: POS Kassa Terminali & Kassirlar Boshqaruvi

### Asosiy Vazifalari:
Doʻkon, kassa, savdo nuqtasi va kassa apparatlari uchun yuqori tezlikdagi sensorli (Touch) savdo terminali.

### Asosiy Imkoniyatlar:
1. **Yangi Kassa Smenasini Ochish (`PosOpenShiftModal.tsx`)**:
   - **Kassir F.I.Sh.**: Xodimlar roʻyxatidan qidiruv va avto-tanlovli **Searchable Combobox** (*Azizbek Toshmatov, Dilfuza Rahimova va b.*).
   - **Boshlangʻich Naqd Pul (Kassa float)**: Standart `500 000 soʻm` va tezkor chiplar (`0`, `100k`, `200k`, `500k`, `1M`, `2M`).
   - Smena ochilganda yuqori panelda `🟢 Smena: Kassir (500 000 soʻm)` koʻrsatkichi va xohlagan paytda smenani yopish imkoniyati.
2. **Smena Z-Hisoboti Termo-Printer Cheki (`PosZReportPrintModal.tsx`)**:
   - 58mm va 80mm kassa printerlari uchun toʻliq fiskal Z-Hisobot: boshlangʻich qoldiq, naqd tushum, Uzcard/Humo terminal tushumi, nasiya savdo, xarajatlar va kassada kutilayotgan naqd pul balansi.
3. **Savdo Operatsiyalari**:
   - Shtrix-kod skanerlaganda bir lahzada savatga qoʻshish.
   - Narx darajalari: *Chakana narx*, *Ulgurji narx (-10%)*, *VIP narx (-5%)*.
   - Toʻxtatilgan savdolar (Held orders / F4) va Kassir kalkulyatori (Alt+C).
   - Boʻlib toʻlash (Split payment): Naqd pul + Uzcard/Humo karta + Nasiya qarz.

---

## 7. 6-Modul: Omborxona & Inventarizatsiya

### Asosiy Vazifalari:
Bir nechta omborlar (Bosh ofis, Sergeli ombori, Chilonzor filiali) boʻyicha qoldiqlarni real vaqtda kuzatish, omborlararo koʻchirish va sklad inventarizatsiyasi.

### Asosiy Imkoniyatlar:
- **Koʻp Omborli Boshqaruv**: Har bir tovarning qaysi omborda qancha qolganligi va minimal kritik chegara (Alert quantity) ogohlantirishlari.
- **Omborlararo Koʻchirish (Stock Transfers)**: Tovarlarni filiallar oʻrtasida yuborish va tranzit nazorati (`Qoralamadan` ➔ `Yoʻlda` ➔ `Qabul qilindi`).
- **Inventarizatsiya va Hisobdan Chiqarish (Audit & Write-Offs)**:
  - Qoldiqlarni qayta sanash.
  - Kamomad chiqsa — Hisobdan chiqarish dalolatnomasi (Akt spisaniya).
  - Ortiqcha tovar chiqsa — Kirim dalolatnomasi (Akt oprixodovaniya).
- **FIFO (First-In, First-Out) Tannarx Qiymatlash Metodi**.

---

## 8. 7-Modul: Moliya, Bank & Buxgalteriya (21-BHMS)

### Asosiy Vazifalari:
Oʻzbekiston Respublikasi 21-sonli Buxgalteriya Hisobi Milliy Standarti (21-BHMS) boʻyicha toʻliq moliyaviy hisobotlar va bank operatsiyalari.

### Asosiy Imkoniyatlar:
1. **1C:ClientBank Formatidagi Bank Koʻchirmalarini Import Qilish (`BankStatementImportModal.tsx`)**:
   - Oʻzbekiston banklarining (*Ipak Yoʻli Bank, Kapitalbank, Agrobank, Hamkorbank, Milliy Bank*) rasmiy `.txt` va `.xml` koʻchirmalarini avtomat tahlil qilish.
   - Barcha kiruvchi va chiquvchi toʻlov topshiriqnomalari (sana, hujjat №, STIR, summa, toʻlov maqsadi) avtomatik ajratilib, mijozlarning ochiq hisob-fakturalari bilan bogʻlanadi va provodkalar shakllantiriladi.
2. **Oʻzbekiston Hisoblar Rejasi (Chart of Accounts)**:
   - `1010` — Asosiy vositalar
   - `2910` — Ombordagi tovarlar
   - `4010` — Xaridorlar va buyurtmachilardan olinadigan schyotlar (Debitorlar)
   - `5010` — Milliy valyutadagi naqd pul mablagʻlari (Kassa)
   - `5110` — Hisob-kitob schyoti (Bank)
   - `6010` — Mollarni yetkazib beruvchilarga toʻlanadigan schyotlar (Kreditorlar)
   - `9010` — Tayyor mahsulotlarni sotishdan daromadlar
3. **Davlat Moliyaviy Hisobotlari**:
   - **1-Shakl**: Buxgalteriya Balansi (Aktiv va Passiv).
   - **2-Shakl**: Moliyaviy Natijalar Toʻgʻrisida Hisobot (Daromadlar va Xarajatlar).
   - **Aylanma Vedomost (Oborotno-salbovaya vedomost / Oborotka)**.

---

## 9. 8-Modul: HRM & Ish Haqi (Payroll)

### Asosiy Vazifalari:
Xodimlarni roʻyxatga olish, lavozim va rollar, oylik maoshni milliy soliqlar boʻyicha avtomat hisoblash va davomat (Tabel).

### Oʻzbekiston Oylik Maosh Soliq Formulalari:
- **JShODS (Daromad soligʻi — НДФЛ)**: `12%` (yalpi hisoblangan oylikdan ushlab qolinadi).
- **Ijtimoiy Soliq (Социальный налог)**: `12%` (korxona mablagʻlari hisobidan toʻlanadi; IT Park rezidentlari uchun `1%`).
- **ShJBPH / INPS (Xalq Banki Jamgʻarib boriladigan pensiya hisobi)**: `0.1%` (JShODS hisobidan ajratiladi).
- **Tabel**: Ish soatlari, kechikishlar, mehnat taʼtillari va kasallik varaqalari jurnali.

---

## 10. 9-Modul: Moliyalashtirish Markazi & Kredit Skoring

### Asosiy Vazifalari:
Kichik va oʻrta biznes uchun aylanma mablagʻlarni toʻldirish, 4 ta yetakchi bank bilan toʻgʻridan-toʻgʻri kredit va lizing arizalarini yuborish.

### Integratsiyalashgan Hamkor Banklar:
1. **Ipak Yoʻli Bank AITB** — Revolving kredit liniyasi, 24 oygacha.
2. **Kapitalbank ATB** — Ekspress biznes overdraft, 12 oygacha.
3. **Biznesni Rivojlantirish Banki (BRB)** — Imtiyozli ishlab chiqarish krediti, 36 oygacha.
4. **Agrobank ATB** — Qishloq xoʻjaligi va savdo aylanma mablagʻlari, 18 oygacha.

### Interaktiv Modallar:
- **«Qanday ishlaydi?»**: 3 bosqichli tushuntirish (Avtomat skoring ➔ Shartlarni tanlash ➔ Bank hisobiga pul tushishi).
- **«Maʼlumotlarni yangilash»**: OKED / IFUT kodi, yillik tushum va bank tekshiruviga rozilik berish shakli.

---

## 11. 10-Modul: E-IMZO, Didox & Davlat Soliq Integratsiyalari

### Asosiy Vazifalari:
Qogʻozsiz ish yuritish, hisob-fakturalarni milliy elektron raqamli imzo (ERI / E-IMZO `.pfx` yoki USB e-token) bilan tasdiqlash va Davlat Soliq Qoʻmitasi tizimiga yuborish.

### Asosiy Imkoniyatlar:
- **E-IMZO Mahalliy Agent Integratsiyasi**: `127.0.0.1:64443` porti orqali brauzerdan chiqmasdan PKCS#7 formatidagi kriptografik imzo qoʻyish.
- **Didox.uz / Factura.uz / Soliq E-Faktura Integratori**: Yuborilgan elektron hujjat holatini (*Yuborildi, Qabul qiluvchi imzoladi, Rad etildi*) real vaqt rejimida yangilash.
- **Soliq Deklaratsiyalari Avto-Generatori**:
  - `Form 10006_29` — QQS 12% oylik hisoboti.
  - `Form 11101_14` — JShODS va Ijtimoiy soliq hisoboti.
  - `Form 10104_18` — Aylanmadan olinadigan soliq (4%) hisoboti.

---

## 12. Administrator Sozlamalari, Filiallar & Xavfsizlik

- **Koʻp Filialli Boshqaruv (Multi-Branch)**:
  - Headerdagi almashtirgich orqali 4 ta filial oʻrtasida tezkor almashish (*Bosh Ofis & Showroom, Chilonzor filiali, Sergeli ombori, Samarqand filiali*).
- **Rol va Huquqlar (RBAC Permissions)**:
  - Administrator, Bosh buxgalter, Sotuv menejeri, Ombor mudiri, Kassir.
- **Foydalanuvchi Profili va Xavfsizlik**:
  - 2FA (Ikki bosqichli autentifikatsiya), IP cheklovlar va audit harakatlar jurnali (Audit logs).
- **Tizim Tili**:
  - Sidebar pastki qismida: Oʻzbekcha (Lotin), Русский, English.
