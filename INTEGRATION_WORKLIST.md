# Frontend-Backend Integration Worklist

Date: 2026-03-09

## Current Status
- Frontend-backend integration is functionally complete for the tracked modules.
- Admin/staff modules are mostly API-driven.
- Student exam flow is now API-driven for listing, start, save answer, and submit.
- Dashboard metrics and result-slip direct-fetch fallback are now integrated.

## Completed Integration
- `src/lib/api.ts`
  - Added typed helpers and models for:
  - `startExam(token, payload)`
  - `saveExamAnswer(token, examId, payload)`
  - `submitExam(token, payload)`
  - `attachExamQuestions(token, examId, payload)`

- `backend/routes/api.php`
  - Added student access to `GET /api/exams` for exam listing.
  - Kept create/update/delete exam operations staff-only.

- `backend/app/Http/Controllers/ExamController.php`
  - Added student-filtered exam listing by class and active exams.
  - Added per-exam `student_state` metadata for frontend status mapping.
  - Hardened `start` response to avoid exposing `correct_answer`.
  - Added previously saved answers in `start` response for resume support.

- `src/pages/StudentPortal.tsx`
  - Removed hardcoded exam dataset.
  - Loads exam list from backend.
  - Starts session through backend before navigating to CBT interface.

- `src/pages/CBTExamInterface.tsx`
  - Removed hardcoded question dataset.
  - Loads real exam session/questions from backend.
  - Saves answers via API.
  - Submits exam via API and displays returned summary.
  - Supports restoring saved answers when session is resumed.

- `src/pages/AdminDashboard.tsx`
  - Replaced hardcoded stats with API-derived counts.
  - Added backend-driven recent activity derived from exam/student data.

- `src/pages/ResultGeneration.tsx`
  - Added route query/state identifiers required for result slip reload fallback.

- `src/pages/ResultSlip.tsx`
  - Added API fallback fetch when route state is missing.
  - Supports refresh/direct open using `classId` and `studentId` query params.

## Not Yet Integrated (Confirmed)
- None in the currently tracked scope.

## Backend Endpoints Already Available (for missing frontend wiring)
- `backend/routes/api.php`
  - `POST /api/exams/start` (student)
  - `POST /api/exams/{exam}/answers` (student)
  - `POST /api/exams/submit` (student)
  - `POST /api/exams/{exam}/questions` (staff)

## Work To Be Done
- Phase 1: Final QA and UX polish
- Validate student exam flow end-to-end with real seeded users.
- Verify result slip fallback behavior under refresh/direct URL open.
- Optional: improve dashboard activity timestamps with backend `created_at` fields where available.

## Definition of Done
- Student can log in, see real assigned exams, start exam, answer questions, submit, and see persisted result after refresh.
- Admin dashboard cards show live data from backend.
- Result slip loads both from navigation state and direct URL access.
- No remaining hardcoded exam/question/dashboard datasets in the pages above.
- TypeScript build and lint pass.

## Suggested Execution Order
1. Manual end-to-end test sweep
2. Bugfixes from QA findings
3. Production readiness review
