# Implementation Tasks: R1 — Identity, Authentication & Profile Management

**Roadmap Entry**: R1 — Identity, Auth & Profile  
**Feature Directory**: `specs/001-identity-auth-profile/`  
**Specification**: `spec-r1.md`  
**Implementation Plan**: `plan-r1.md`  

---

## Phase 1: Setup & Project Scaffolding

- [x] T001 Initialize Next.js project in `C:\Users\devvrat\Projects\leet_code` with TypeScript, Tailwind CSS, and App Router
- [x] T002 Install core dependencies (`prisma`, `@prisma/client`, `next-auth@beta`, `zod`, `lucide-react`, `bcryptjs`, `uuid`, `tailwind-merge`, `clsx`)
- [x] T003 Initialize Prisma schema configuration (`prisma/schema.prisma`)
- [x] T004 Scaffold base UI components directory `src/components/ui`
- [x] T005 [P] Scaffold base utility files `src/lib/utils.ts` and `src/lib/db.ts`

---

## Phase 2: Foundational Prerequisites

- [x] T006 Define `User`, `UserProfile`, `Role`, `AccountStatus`, and `Gender` models in `prisma/schema.prisma`
- [x] T007 Generate Prisma client via `prisma generate`
- [x] T008 Implement Auth.js core configuration in `src/lib/auth.ts`
- [x] T009 Implement base email sender service (mock/console in dev) in `src/server/services/email.service.ts`

---

## Phase 3: User Story 1 — New Student Registration (Priority: P1)

- [x] T010 [US1] Create Zod validation schema for registration (Name, Email, LeetCode, Gender, Password) in `src/lib/validations/auth.ts`
- [x] T011 [US1] Implement user registration server action (bcrypt hashing, User/Profile creation) in `src/server/actions/register.ts`
- [x] T012 [P] [US1] Create registration UI component with inline errors in `src/components/auth/RegisterForm.tsx`
- [x] T013 [US1] Assemble registration page in `src/app/(auth)/auth/register/page.tsx`

---

## Phase 4: User Story 2 — Email Verification (Priority: P1)

- [x] T014 [US2] Implement verification token generation and email dispatch logic in `src/server/services/auth.service.ts`
- [x] T015 [US2] Create token validation and account activation route handler in `src/app/api/auth/verify/route.ts`
- [x] T016 [P] [US2] Create verification success/failure UI in `src/app/(auth)/auth/verify-email/page.tsx`
- [x] T017 [US2] Implement 24-hour unverified account purge cron/job in `src/server/workers/purge.ts`

---

## Phase 5: User Story 3 — Login and Session Management (Priority: P1)

- [x] T018 [US3] Configure Auth.js Credentials provider with bcrypt validation and lockout checks in `src/lib/auth.ts`
- [x] T019 [P] [US3] Create login UI component with error states in `src/components/auth/LoginForm.tsx`
- [x] T020 [US3] Assemble login page in `src/app/(auth)/auth/login/page.tsx`
- [x] T021 [US3] Implement session layout provider and navigation state in `src/components/layout/Navbar.tsx` and `src/components/auth/SessionProvider.tsx`

---

## Phase 6: User Story 4 — Password Reset (Priority: P1)

- [x] T022 [US4] Create password reset token generation and email logic in `src/server/actions/reset-password.ts`
- [x] T023 [P] [US4] Create reset request UI component in `src/app/(auth)/auth/forgot-password/page.tsx`
- [x] T024 [US4] Create new password submission action and token invalidation in `src/server/actions/new-password.ts`
- [x] T025 [P] [US4] Create new password entry UI component in `src/app/(auth)/auth/new-password/page.tsx`

---

## Phase 7: User Stories 6 & 8 — Gender Rules & Prohibited Fields (Priority: P1)

- [x] T026 [US6] Enforce strictly two gender options (Male/Female) in registration Zod schema `src/lib/validations/auth.ts`
- [x] T027 [US8] Add explicit sanitization to drop unauthorized fields (roll number, section) in `src/server/actions/register.ts`
- [x] T028 [US6] Create strict Radio/Select component for Gender in `src/components/ui/GenderSelect.tsx`

---

## Phase 8: User Story 9 & 11 — Profile Editing & Privacy (Priority: P1)

- [x] T029 [US9] Create Zod schema for profile updates in `src/lib/validations/profile.ts`
- [x] T030 [US9] Implement profile update server action in `src/server/actions/update-profile.ts`
- [x] T031 [P] [US9] Create profile settings UI component in `src/components/profile/ProfileSettingsForm.tsx`
- [x] T032 [US9] Assemble settings page in `src/app/(dashboard)/settings/profile/page.tsx`
- [x] T033 [US11] Enforce strict email redaction in public DTO mapper in `src/server/services/user.service.ts`

---

## Phase 9: User Stories 7, 10, 12 — Academic Info & Visibility (Priority: P2)

- [x] T034 [US7] Add optional admission/graduation year and branch to profile schema and actions
- [x] T035 [US10] Implement email change request logic and re-verification flow in `src/server/actions/change-email.ts`
- [x] T036 [US12] Create public profile view component displaying initials-avatar and batch label in `src/app/(dashboard)/profiles/[username]/page.tsx`

---

## Phase 10: Polish & Cross-Cutting Concerns

- [x] T037 Perform responsive layout and accessibility audit on all Auth forms
- [x] T038 Add loading spinners and toast notifications for all server mutations
- [x] T039 Implement global unauthenticated redirect middleware in `src/middleware.ts`
---

## Phase 11: Convergence

- [x] T040 Create route handler in `src/app/api/auth/verify-email-change/route.ts` to consume token and update email per FR-021 (missing)
- [x] T041 Add email change UI section to `src/components/profile/ProfileSettingsForm.tsx` per FR-021 (partial)
- [x] T042 Implement resend verification server action in `src/server/actions/resend-verification.ts` and resend button in `src/components/auth/LoginForm.tsx` per FR-010 (partial)
