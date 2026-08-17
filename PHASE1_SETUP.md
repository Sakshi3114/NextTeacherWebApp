# Phase 1: Foundation rebuild — what changed and why

This document summarizes the Phase 1 rewrite for future reference (and as a record of what was actually wrong with the original project).

## What was broken before

- **No real authentication.** Admin "login" was a hardcoded client-side password (`admin@123`) with zero server enforcement — `/admin/**` and every mutating API route were reachable by anyone who knew the URL. Teacher "login" returned a bare ID with no session/cookie/JWT; identity for posting notices was carried in an editable URL query string.
- **Two disconnected data models.** A teacher's schedule record and their notice-posting account were separate MongoDB collections matched only by informal name/email string equality — never joined.
- **Hardcoded, git-committed database credentials** in `lib/dbConnect.js`.
- **Mass-assignment, unescaped search input, leaked password hashes in API responses, no pagination, no rate limiting** — see the project's saved plan for the full audit.
- **A broken shadcn/ui setup** — the CSS custom properties every component relied on were referenced but never defined, so the design system was effectively running on undefined tokens.

## What Phase 1 replaced it with

- **PostgreSQL + Prisma**, with one unified `User` → `Teacher`/`Student` relational model instead of two disconnected collections. Fixed `lecture1..lecture8` columns became a normalized `Period` table (day, time range, room, subject), so a teacher can have any number of periods.
- **Auth.js v5**, credentials provider, JWT sessions, roles (`ADMIN` / `TEACHER` / `STUDENT`) enforced two ways: `middleware.js` blocks unauthorized requests to `/admin/**` and `/teacher/**` before they render, and every Server Action independently re-checks `session.user.role` (defense in depth — middleware alone doesn't cover every entry point).
- **No self-registration.** Admin accounts come from the seed script; teacher accounts are created by an admin, closing the old "anyone can register as a teacher" gap.
- **zod validation on every mutation**, shared between the client form and the server action, with an explicit field whitelist — this is what fixes the old mass-assignment bug.
- **A working shadcn/ui token layer** (`app/globals.css`), a generic `DataTable` (replacing three duplicated hand-written tables), and react-hook-form-based forms (replacing an uncontrolled-ref pattern with no validation).

## Known limitations (by design, for now)

- Password reset is manual-by-admin — there's no email provider wired up yet.
- The timetable is seed-data only in this phase; the visual timetable *builder* UI is Phase 2.
- Student accounts aren't wired up yet (the `Student` model exists in the schema, but the sign-in flow is Phase 3).

## Roadmap

- **Phase 2** — visual timetable builder with conflict detection, attendance tracking.
- **Phase 3** — admin-created student rosters, leave/substitution requests, in-app notifications, notice read-receipts.
- **Phase 4** — admin analytics dashboard, calendar view, avatar upload, dark mode, CSV export.
