# 🔒 SAPAR ERP — Security Policy & Compliance Standards

## 1. Security Architecture Overview

SAPAR ERP is engineered with defense-in-depth security principles to protect enterprise financial data, payroll records, and national tax compliance documents in accordance with the Law of the Republic of Uzbekistan on Personal Data Protection (Law No. ZRU-547).

### Core Security Controls:
- **Role-Based Access Control (RBAC)**: Granular per-module permissions (`create`, `edit`, `delete`, `view`, `allowAll`) across 63 distinct enterprise modules.
- **Tenant Isolation**: Multi-tenant data scoping enforced on every API route via cryptographic JWT claims (`ownerId` / `userId`).
- **Cryptographic Signatures**: Native E-IMZO integration using PKCS#7 with national GOST / RSA digital certificates without exposing private keys to the cloud.
- **Data Encryption**:
  - Passwords hashed using `bcrypt` (12 rounds).
  - Stored API credentials and third-party keys encrypted with **AES-256-GCM** using unique machine keys (`AI_ENCRYPTION_KEY`).
  - TLS 1.3 enforced for all transport-layer communications.
- **Input Sanitization & SQL Injection Prevention**: Full schema typing and parameterized queries powered by Prisma ORM.

---

## 2. Reporting a Vulnerability

We take the security of our platform and user data seriously. If you discover a security vulnerability, please report it responsibly:

1. **Email**: Send details to `security@sapar.uz` or `buildforward33@gmail.com`.
2. **Details to Include**:
   - Description of the issue and potential impact.
   - Step-by-step reproduction steps or proof-of-concept.
   - Affected endpoints or components.
3. **Response Time**: Our security team will acknowledge receipt within 24 hours and provide a remediation timeline.

Please do **NOT** publicly disclose any security vulnerabilities until a patch has been released.
