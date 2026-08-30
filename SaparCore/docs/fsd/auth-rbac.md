# FSD — Authentication & RBAC

**Module slug:** `auth-rbac`
**File:** `docs/fsd/auth-rbac.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Auth & RBAC module manages identity, access control, and session management:

- **Authentication methods** — Email+password, Phone+OTP, Phone+password, E-IMZO PKCS#7 digital signature, QR code session
- **Multi-tenant user model** — owner + staff (ownerId FK), with staff scoped to owner's data
- **Role-Based Access Control** — Role → Permission → Module hierarchy; enforced per-route via middleware
- **User profile** — avatar, name, email, phone, language preference, 2FA toggle
- **Invitation system** — invite staff by email; invited users self-register with a token

**Regional scope:** Uzbekistan. Phone authentication uses Uzbekistan phone format (`+998 xx xxx-xx-xx`). E-IMZO authentication uses national digital certificates issued by the Uzbekistan Certificate Authority (Davlat Kalitlari).

---

## 2. Data Model

### 2.1 User

```prisma
model User {
  id              String    @id @default(uuid())
  firstName       String?
  lastName        String?
  email           String?   @unique
  phone           String?
  password        String    // bcrypt hashed
  profileImage    String?
  user_type       Int?      @default(1)   // 1=owner, 2=staff
  ownerId         String?   // null for owner; = owner.id for staff
  language        String?   @default("en")
  currency        String?   @default("UZS")
  currency_symbol String?   @default("soʻm")
  roleId          String?   // RBAC role FK
  twoFactorEnabled Boolean  @default(false)
  twoFactorSecret String?   // TOTP secret (encrypted)
  isDeleted       Boolean   @default(false)
  
  // Relations
  role            Role?
  ownedProfiles   User[]    @relation("UserOwner")  // staff under this owner
  payrollProfiles PayrollProfile[] @relation("EmployeePayrollProfile")
  projectMembers  ProjectMember[]
  timesheets      Timesheet[]
  leaveRequests   LeaveRequest[]
  // ... all other back-relations
}
```

### 2.2 Role + Permission + Module (RBAC)

```prisma
model Role {
  id          String       @id @default(uuid())
  userId      String       // tenant (owner)
  name        String
  description String?
  isDefault   Boolean      @default(false)
  users       User[]
  permissions Permission[]
}

model Permission {
  id       String     @id
  roleId   String
  moduleId String
  canView  Boolean    @default(false)
  canCreate Boolean   @default(false)
  canEdit  Boolean    @default(false)
  canDelete Boolean   @default(false)
  module   Module
}

model Module {
  id          String       @id
  name        String       @unique
  description String?
  permissions Permission[]
}
```

**Standard modules:** `dashboard`, `invoices`, `quotations`, `credit-notes`, `delivery-challans`, `purchases`, `purchase-orders`, `debit-notes`, `expenses`, `petty-cash`, `contacts`, `inventory`, `banking`, `payroll`, `hrm`, `projects`, `pos`, `crm`, `e-documents`, `accounting`, `reports`, `settings`, `ai`, `helpdesk`.

### 2.3 UserInvitation

```prisma
model UserInvitation {
  id          String   @id
  ownerId     String   // who sent the invite
  email       String
  roleId      String?
  token       String   @unique  // UUID for registration link
  expiresAt   DateTime
  usedAt      DateTime?
  isUsed      Boolean  @default(false)
}
```

### 2.4 CompanySettings (Auth-relevant fields)

```prisma
model CompanySettings {
  // ...
  approvalsEnabled   Boolean @default(false)   // Maker-checker for financial docs
  twoFactorRequired  Boolean @default(false)   // Enforce 2FA for all staff
  sessionTimeoutMins Int     @default(480)     // JWT expiry
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Standard Auth

| Method | Path | Controller |
|--------|------|-----------|
| `POST` | `/auth/login` | `authController.ts::login` |
| `POST` | `/auth/register` | `authController.ts::register` |
| `POST` | `/auth/logout` | `authController.ts::logout` |
| `POST` | `/auth/forgot-password` | `authController.ts::forgotPassword` |
| `POST` | `/auth/reset-password` | `authController.ts::resetPassword` |
| `POST` | `/auth/change-password` | `authController.ts::changePassword` |
| `GET` | `/auth/me` | `authController.ts::getMe` |
| `POST` | `/auth/refresh` | token refresh |

#### Uzbekistan Auth (uzAuthController.ts)

| Method | Path |
|--------|------|
| `POST` | `/auth/uz/phone-otp/send` |
| `POST` | `/auth/uz/phone-otp/verify` |
| `POST` | `/auth/uz/phone-password/login` |
| `GET` | `/auth/uz/eimzo/challenge` |
| `POST` | `/auth/uz/eimzo/verify` |
| `POST` | `/auth/uz/qr/session` |
| `GET` | `/auth/uz/qr/session/:id` |
| `POST` | `/auth/uz/qr/session/approve` |

#### User Management

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/users` | `userController.ts::getUsers` |
| `POST` | `/admin/users` | `userController.ts::createUser` |
| `PUT` | `/admin/users/:id` | `userController.ts::updateUser` |
| `DELETE` | `/admin/users/:id` | `userController.ts::deleteUser` |
| `POST` | `/admin/invitations` | `userController.ts::inviteUser` |
| `GET` | `/auth/accept-invite/:token` | validate invite token |
| `POST` | `/auth/accept-invite/:token` | complete registration |

#### RBAC

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/roles` | `roleController.ts::getRoles` |
| `POST` | `/admin/roles` | `roleController.ts::createRole` |
| `PUT` | `/admin/roles/:id` | `roleController.ts::updateRole` |
| `DELETE` | `/admin/roles/:id` | `roleController.ts::deleteRole` |
| `GET` | `/admin/modules` | `moduleController.ts::getModules` |
| `PUT` | `/admin/roles/:id/permissions` | `roleController.ts::updatePermissions` |

### 3.2 Business Logic

**JWT token structure:**
```json
{
  "sub": "<userId>",
  "tenantId": "<ownerId or userId if owner>",
  "exp": "<now + sessionTimeoutMins>",
  "iat": "<now>"
}
```

**Tenant scoping (`lib/tenantScope.ts::requireUserId`):**
```typescript
export function requireUserId(req: Request): string {
  const user = (req as any).user;
  if (!user?.id) throw new UnauthorizedError('Authentication required');
  // Returns ownerId if staff, userId if owner
  return user.ownerId || user.id;
}
```
Every data-reading query filters by this `userId`. Staff see only their owner's data.

**RBAC middleware:**
```typescript
// Checks req.user.roleId → Permission.canView/canCreate/canEdit/canDelete
// for the accessed module
requirePermission('invoices', 'canCreate')
```

**E-IMZO challenge-response:**
1. `GET /auth/uz/eimzo/challenge` → generates `{challengeId: uuid, nonce: 64-char hex, expiresAt: now+60s}`
2. Challenge stored in `EimzoAuthService` in-memory map
3. `POST /auth/uz/eimzo/verify` → verifies nonce not expired, checks PKCS#7 signature structure, extracts `certInfo.tin`
4. Looks up `User` by TIN; falls back to `user_type=1` (main owner)

**SMS OTP:**
- `SmsService.sendOtp(phone)` → sends OTP via configured SMS gateway (Uzbekistan-specific: likely Eskiz.uz, Playmobile.uz)
- OTP stored in `SmsService` in-memory map with 5-minute TTL
- `SmsService.normalizeUzPhone`: handles `+998`, `998`, `0` prefixes

**Invitation flow:**
1. Owner sends invite → `UserInvitation` created with `token`, `expiresAt = +48h`
2. Email sent to invitee with link `/auth/accept-invite/{token}`
3. Invitee opens link → fills name + password → account created with `ownerId = inviter.id`
4. Invitation marked `isUsed = true`

### 3.3 Validation Rules

- Email must be unique globally (`User.email @unique`)
- Password: minimum 8 characters (client-side; no server-side complexity rule visible)
- Phone must normalize to `+998` format for Uzbekistan OTP
- Invitation `token` expires after 48 hours
- Cannot delete an owner user (validation in `deleteUser`)
- Cannot delete a role that has active users assigned
- `Permission.canView` must be `true` if any other permission (`canCreate/canEdit/canDelete`) is `true`

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Login | `pages/auth/LoginPage.tsx` | `/login` |
| Register | `pages/auth/RegisterPage.tsx` | `/register` |
| Forgot Password | `pages/auth/ForgotPassword.tsx` | `/forgot-password` |
| Reset Password | `pages/auth/ResetPassword.tsx` | `/reset-password` |
| Accept Invite | `pages/auth/AcceptInvite.tsx` | `/auth/accept-invite/:token` |
| User Management | `pages/admin/settings/UserManagement.tsx` | `/admin/settings/users` |
| Role Management | `pages/admin/settings/RoleManagement.tsx` | `/admin/settings/roles` |
| Module Permissions | `pages/admin/settings/ModulePermissions.tsx` | `/admin/settings/roles/:id/permissions` |
| My Profile | `pages/admin/settings/ProfilePage.tsx` | `/admin/profile` |

### 4.2 User Flows

**Standard Login:**
1. Enter email + password → `POST /auth/login`
2. 2FA optional TOTP input if enabled
3. JWT stored in `localStorage` / `AuthContext`
4. Redirect to `/admin/dashboard`

**E-IMZO Login:**
1. Login page → "E-IMZO orqali kirish" tab
2. Click button → E-IMZO browser extension opens certificate picker
3. Select certificate → extension signs nonce
4. `POST /auth/uz/eimzo/verify` → JWT returned
5. Authenticated as TIN-matched user

**Invite Staff:**
1. Settings → Users → "Taklif yuborish" (Invite)
2. Enter email, select role
3. System sends invite email with accept link
4. Staff opens link → fills name/password → account created

**Configure RBAC:**
1. Settings → Roles → "Yangi rol" (New Role)
2. Name the role (e.g., "Kassir", "Buxgalter", "Omborchi")
3. Roles → Permissions grid: toggle can_view/can_create/can_edit/can_delete per module
4. Save → assign role to users

### 4.3 Key Components

- `LoginPage.tsx` (22 KB): Multi-method login tabs (Email/Password, Phone+OTP, E-IMZO, QR Code). Language switcher (uz/ru/en).
- `RoleManagement.tsx` (18 KB): Role list with CRUD. Expandable permission matrix per role.
- `ModulePermissions.tsx` (12 KB): Checkbox grid of all modules × 4 permission levels for a selected role.
- `UserManagement.tsx` (16 KB): Staff user list with role badges, invite button, deactivate toggle.

---

## 5. Integrations

- **E-IMZO Browser Extension (`ws://127.0.0.1:64443`):** Used for authentication challenge signing. Same extension used for document signing in the E-Documents module.
- **SMS Gateway:** `SmsService` sends OTP via Uzbekistan SMS providers. Provider configured via `process.env.SMS_PROVIDER`.
- **All modules:** RBAC middleware (`requirePermission`) wraps all protected admin routes in `adminRoutes.js`.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **E-IMZO user matching is weak** | 🔴 Critical | `verifyEimzoSignature` falls back to `user_type=1` (first admin) if no TIN match. In multi-user workspaces, any E-IMZO certificate authenticates as the admin. Must match on `User.phone` or a dedicated `User.stir` field. |
| 2 | **SMS OTP in-memory only** | 🟡 Medium | OTP codes stored in `SmsService` process-local map. Lost on restart. Multi-instance deployments (e.g., behind a load balancer) would fail OTP verification. Must use Redis or DB-backed OTP store. |
| 3 | **QR session approval hardcoded to first admin** | 🔴 Critical | `approveQrSession` also falls back to `user_type=1`. Same multi-user issue as E-IMZO. |
| 4 | **E-IMZO challenge in-memory** | 🟡 Medium | Challenge nonces stored in `EimzoAuthService` process-local map. Same restart/multi-instance issue as OTP. |
| 5 | **No TOTP 2FA UI** | 🟡 Medium | `User.twoFactorEnabled` and `twoFactorSecret` exist in the schema but the TOTP enrollment UI and server-side TOTP verification are not visible in the codebase. |
| 6 | **Password complexity not enforced** | 🟢 Low | No server-side password strength validation. Only minimum length could be inferred. |
| 7 | **Invitation email not confirmed in code** | 🟢 Low | The invite email sending call needs to be verified in `emailService.ts`. If misconfigured, invites silently fail. |
| 8 | **No `User.stir` field** | 🟡 Medium | STIR (TIN) is not a first-class field on `User`. E-IMZO login relies on matching certificate TIN to either `User.phone` or falling back to first admin. |
