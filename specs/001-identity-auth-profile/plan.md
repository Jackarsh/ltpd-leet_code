# Implementation Plan: R1 — Identity, Authentication & Profile Management

**Roadmap Entry**: R1 — Identity, Auth & Profile  
**Feature Directory**: [`specs/001-identity-auth-profile/`](file:///C:/Users/devvrat/Projects/leet_code/specs/001-identity-auth-profile/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Implement secure student authentication, email verification, profile management, and account lifecycle controls without collecting prohibited academic identifiers.

---

## 2. Technical Architecture & Components

### 2.1. Authentication Subsystem
- **Provider**: Auth.js (NextAuth v5) with Prisma Adapter.
- **Strategies**:
  - Email Magic Link (Passwordless via SMTP/Resend).
  - Secure Email + Password (Argon2id / bcrypt password hashing).
- **Session Management**: Encrypted HTTP-only secure cookies with JWT session strategy containing `userId`, `email`, `role`, and `status`.

### 2.2. Frontend Routes & UI Components
- `src/app/(auth)/login/page.tsx`: Clean, accessible login form.
- `src/app/(auth)/register/page.tsx`: Registration form with mandatory fields (Name, Email, LeetCode Username, Gender [Male/Female]) and optional fields (Admission Year, Graduation Year, Branch).
- `src/app/(auth)/verify-email/page.tsx`: Verification token confirmation screen.
- `src/app/(student)/settings/profile/page.tsx`: Self-service profile editor.
- `src/components/auth/RegisterForm.tsx`: Zod-validated registration wizard.
- `src/components/auth/LoginForm.tsx`: Credentials and Magic Link login component.

### 2.3. Backend Services & Server Actions
- `src/server/services/auth.service.ts`: User registration, password verification, token generation, email dispatch.
- `src/server/services/user.service.ts`: Profile metadata updates, branch association, avatar uploads, password changes.

---

## 3. Data Model & Prisma Schema Slice

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String?
  role          Role           @default(STUDENT)
  status        AccountStatus  @default(PENDING_VERIFICATION)
  emailVerified DateTime?
  profile       UserProfile?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([email])
  @@index([status])
}

model UserProfile {
  id             String          @id @default(uuid())
  userId         String          @unique
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  displayName    String
  gender         Gender          // MALE | FEMALE (Strictly explicit)
  admissionYear  Int?
  graduationYear Int?
  branchId       String?
  branch         AcademicBranch? @relation(fields: [branchId], references: [id], onDelete: SetNull)
  avatarUrl      String?
  bio            String?         @db.VarChar(300)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([gender])
  @@index([branchId])
}
```

---

## 4. API Endpoints & Contracts

- `POST /api/auth/register`: Validate input, create user, trigger verification email.
- `POST /api/auth/verify`: Validate verification token and mark email verified.
- `GET /api/me`: Returns current user identity and profile DTO.
- `PATCH /api/me/profile`: Update editable profile fields (displayName, gender, branch, batch, bio).

---

## 5. Verification & Testing Strategy

- **Unit Tests**: Zod schema validation rules (mandatory gender choice, email format, rejection of forbidden fields).
- **Integration Tests**: Prisma user creation, password hashing roundtrip, session cookie issuing.
- **E2E Tests**: Complete onboarding user journey (Register → Receive Verification Link → Login → Update Profile).
