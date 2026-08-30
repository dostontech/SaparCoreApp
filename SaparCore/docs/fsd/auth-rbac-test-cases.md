# Authentication, RBAC & Multi-Tenancy Test Specification

**Document:** `docs/fsd/auth-rbac-test-cases.md`  
**Module:** Authentication, RBAC & Multi-Tenancy (`docs/fsd/auth-rbac.md`)  
**Standard:** Uzbekistan Enterprise Multi-Tenancy & Zero Data Leakage  

---

## 📋 Test Matrix Overview

| Suite | Focus Area | Test Cases |
|---|---|---|
| **Suite 01** | Authentication & Token Lifecycle | `TC-AUTH-001` – `TC-AUTH-005` |
| **Suite 02** | Tenant Data Isolation & Cross-Tenant Leakage | `TC-AUTH-006` – `TC-AUTH-010` |
| **Suite 03** | Multi-Tenancy Owner vs Staff Hierarchy | `TC-AUTH-011` – `TC-AUTH-015` |
| **Suite 04** | Role-Based Access Control (RBAC) Matrix | `TC-AUTH-016` – `TC-AUTH-020` |
| **Suite 05** | User Invitations & Self-Registration | `TC-AUTH-021` – `TC-AUTH-025` |
| **Suite 06** | Uzbekistan Auth (Phone OTP & E-IMZO Challenge) | `TC-AUTH-026` – `TC-AUTH-030` |

---

## Suite 01: Authentication & Token Lifecycle

### `TC-AUTH-001` — Standard Email/Password Authentication
- **Step 1:** Submit valid email and password to `POST /api/auth/login`.
- **Step 2:** Verify API returns HTTP 200 with JWT access token and user payload.
- **Step 3:** Call `GET /api/auth/me` with the bearer token and verify authenticated user profile.
- **Expected:** Valid login succeeds, token is decoded, user profile matches credentials.

### `TC-AUTH-002` — Invalid Credentials Rejection
- **Step 1:** Submit invalid password for an existing email to `POST /api/auth/login`.
- **Step 2:** Submit an unregistered email to `POST /api/auth/login`.
- **Expected:** Both rejected with HTTP 400/401 (`Invalid credentials` or `User not found`).

### `TC-AUTH-003` — Token Expiration & Unauthenticated Route Protection
- **Step 1:** Attempt to access protected admin endpoint `GET /api/admin/invoices` without Authorization header.
- **Step 2:** Attempt access with a malformed/tampered JWT token.
- **Expected:** Both requests return HTTP 401 Unauthorized.

### `TC-AUTH-004` — Password Change with Current Password Verification
- **Step 1:** Authenticated user calls `POST /api/auth/change-password` with wrong `currentPassword`.
- **Step 2:** Verify request is rejected.
- **Step 3:** Submit valid `currentPassword` and new password, verify success.
- **Expected:** Password update requires valid current password verification.

### `TC-AUTH-005` — User Registration & Duplicate Email Guard
- **Step 1:** Attempt to register a user with an already existing email.
- **Step 2:** Verify rejection with 400/409 Conflict.
- **Expected:** Global email uniqueness enforced.

---

## Suite 02: Tenant Data Isolation & Cross-Tenant Leakage

### `TC-AUTH-006` — Invoice Data Isolation
- **Step 1:** Tenant A creates an invoice.
- **Step 2:** Tenant B attempts to fetch Tenant A's invoice via `GET /api/admin/invoices/:id`.
- **Step 3:** Tenant B attempts to query `GET /api/admin/invoices` and checks if Tenant A's invoice is in the list.
- **Expected:** Direct access returns 404/403; listing returns empty/Tenant B invoices only. Zero leakage.

### `TC-AUTH-007` — Contact & Customer Isolation
- **Step 1:** Tenant A creates a Contact.
- **Step 2:** Tenant B queries `GET /api/admin/contacts` and `GET /api/admin/contacts/:id`.
- **Expected:** Tenant B cannot see or access Tenant A's contacts.

### `TC-AUTH-008` — Chart of Accounts & General Ledger Isolation
- **Step 1:** Tenant A creates custom Account or posts Journal Entries.
- **Step 2:** Tenant B calls `GET /api/admin/accounts` and `GET /api/admin/general-ledger/entries`.
- **Expected:** Tenant B's ledger reads only Tenant B's accounts and journal entries.

### `TC-AUTH-009` — Inventory & Product Isolation
- **Step 1:** Tenant A creates a Product with stock layers.
- **Step 2:** Tenant B attempts to sell/query Tenant A's product ID.
- **Expected:** Product not found in Tenant B's catalog.

### `TC-AUTH-010` — Cross-Tenant Mutation Rejection
- **Step 1:** Tenant B attempts `PUT /api/admin/invoices/:tenantA_InvoiceId` or `DELETE /api/admin/contacts/:tenantA_ContactId`.
- **Expected:** Mutations across tenants are strictly rejected with 404/403.

---

## Suite 03: Multi-Tenancy Owner vs Staff Hierarchy

### `TC-AUTH-011` — Owner Creates Staff User
- **Step 1:** Tenant Owner creates a staff user with `user_type = 2` and `ownerId = owner.id`.
- **Step 2:** Verify staff user record links directly to owner.
- **Expected:** Staff user created successfully.

### `TC-AUTH-012` — Staff Scoped to Owner Workspace
- **Step 1:** Staff user logs in via `POST /api/auth/login`.
- **Step 2:** Staff queries `GET /api/admin/invoices` and `GET /api/admin/contacts`.
- **Expected:** `requireUserId(req)` resolves to `owner.id`, giving staff access to the owner's workspace data.

### `TC-AUTH-013` — Staff Cannot Delete Workspace Owner
- **Step 1:** Staff user attempts `DELETE /api/admin/users/:ownerId`.
- **Expected:** Rejected with 400/403 Forbidden.

### `TC-AUTH-014` — Staff Multi-Currency & Settings Inheritance
- **Step 1:** Staff fetches `/api/admin/company-settings`.
- **Expected:** Inherits owner's functional currency (`UZS`), tax regime (`VAT_GENERIC`), and company profile.

### `TC-AUTH-015` — Deactivated Staff Token Invalidation
- **Step 1:** Owner soft-deletes/deactivates staff user (`isDeleted = true`).
- **Step 2:** Staff attempts API access.
- **Expected:** Rejected with 401/403 Unauthorized.

---

## Suite 04: Role-Based Access Control (RBAC) Matrix

### `TC-AUTH-016` — Role Creation & Permission Assignment
- **Step 1:** Owner creates a custom Role "Cashier" with permissions:
  - `pos`: view=true, create=true
  - `invoices`: view=true, create=false
  - `accounting`: view=false, create=false
- **Expected:** Role and permissions matrix persist cleanly in database.

### `TC-AUTH-017` — Cashier Role Route Enforcement
- **Step 1:** Assign Cashier role to staff user.
- **Step 2:** Staff calls `POST /api/admin/pos/checkout` $\to$ Allowed.
- **Step 3:** Staff calls `POST /api/admin/invoices` $\to$ Blocked with 403 Forbidden.
- **Step 4:** Staff calls `GET /api/admin/general-ledger/trial-balance` $\to$ Blocked with 403 Forbidden.
- **Expected:** Precise RBAC route-level gating.

### `TC-AUTH-018` — Accountant Role Route Enforcement
- **Step 1:** Create "Accountant" role with full `accounting`, `invoices`, `reports` permissions, but no `settings` or `users` permissions.
- **Step 2:** Accountant accesses Trial Balance and Invoices $\to$ Allowed.
- **Step 3:** Accountant calls `POST /api/admin/users` $\to$ Blocked with 403 Forbidden.
- **Expected:** Accountant operates within financial boundary without user management privilege.

### `TC-AUTH-019` — System Admin Role Bypass
- **Step 1:** Workspace Owner (`user_type = 1` or Admin role) accesses any route.
- **Expected:** All modules accessible without restriction.

### `TC-AUTH-020` — Role Deletion Guard with Active Users
- **Step 1:** Attempt to delete a role currently assigned to active staff.
- **Expected:** Rejected with 400 Bad Request ("Cannot delete role with assigned users").

---

## Suite 05: User Invitations & Self-Registration

### `TC-AUTH-021` — Owner Generates Staff Invitation
- **Step 1:** Owner calls `POST /api/admin/invitations` with `{ email, roleId }`.
- **Step 2:** Verify `UserInvitation` created with cryptographic `token` and 48-hour expiration.
- **Expected:** Invitation stored with valid token.

### `TC-AUTH-022` — Validate Invitation Token
- **Step 1:** Call `GET /api/auth/accept-invite/:token` with valid token.
- **Expected:** Returns HTTP 200 with tenant and role info.

### `TC-AUTH-023` — Complete Registration via Invitation Token
- **Step 1:** Invitee submits password and name to `POST /api/auth/accept-invite/:token`.
- **Step 2:** Verify new User created with `ownerId = inviter.id` and assigned `roleId`.
- **Step 3:** Verify invitation marked `isUsed = true`.
- **Expected:** User registered, correctly scoped to tenant.

### `TC-AUTH-024` — Expired Token Rejection
- **Step 1:** Attempt to accept an invitation where `expiresAt < now()`.
- **Expected:** Rejected with 400 Bad Request ("Invitation token has expired").

### `TC-AUTH-025` — Single-Use Token Reuse Prevention
- **Step 1:** Attempt to reuse an already accepted invitation token (`isUsed = true`).
- **Expected:** Rejected with 400 Bad Request ("Invitation already used").

---

## Suite 06: Uzbekistan Auth (Phone OTP & E-IMZO Challenge)

### `TC-AUTH-026` — Uzbekistan Phone Format Normalization (+998)
- **Step 1:** Submit variations: `998901234567`, `+998901234567`, `901234567`.
- **Expected:** Normalized consistently to `+998901234567`.

### `TC-AUTH-027` — Phone OTP Generation & TTL Expiry
- **Step 1:** Call `POST /api/auth/uz/phone-otp/send` with valid Uzbekistan number.
- **Expected:** OTP generated with 5-minute TTL.

### `TC-AUTH-028` — E-IMZO Challenge Generation
- **Step 1:** Call `GET /api/auth/uz/eimzo/challenge`.
- **Expected:** Returns `{ challengeId, nonce, expiresAt }` (64-character hex nonce, 60s TTL).

### `TC-AUTH-029` — E-IMZO Expired Nonce Rejection
- **Step 1:** Attempt verification with expired challenge ID.
- **Expected:** Rejected with 400 Bad Request ("Challenge expired").

### `TC-AUTH-030` — User Two-Factor Authentication Toggle
- **Step 1:** Enable 2FA on user profile.
- **Step 2:** Verify `twoFactorEnabled` persists on User model.
- **Expected:** 2FA status toggled cleanly.
