# 📚 Teacher Schedule Check

A school directory, timetable, and notice board for admins, teachers, and (soon) students — rebuilt on a real relational schema and server-enforced authentication.

This is a from-scratch rewrite of an earlier MongoDB-backed college project. The previous version had no real access control (a hardcoded client-side admin password, no server session checks); this version fixes that from the ground up. See `PHASE1_SETUP.md` for the exact problems that were fixed.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions + a small REST surface for Auth.js
- **Database**: PostgreSQL (via [Neon](https://neon.tech)) + Prisma ORM
- **Auth**: Auth.js (NextAuth) v5 — credentials login, server-verified roles (`ADMIN` / `TEACHER` / `STUDENT`)
- **Forms/validation**: react-hook-form + zod (shared schema between client and server)
- **Deployment**: Vercel

---

## ✨ Current features (Phase 1)

- **Admin**: manage teachers, departments, and subjects from a real dashboard — every mutation is validated with zod and re-checked server-side against the signed-in admin's role.
- **Teacher**: sign in to see your own weekly schedule and post notices under your own identity (no more spoofable URL parameters).
- **Public**: search the teacher directory by name/department, view a teacher's schedule, browse the notice feed.
- **Security**: server-side route protection via `middleware.js` (not a client-side password check), whitelisted form inputs (no mass-assignment), parameterized search (no regex-injection surface).

Student accounts, a visual timetable builder, attendance tracking, leave/substitution requests, in-app notifications, and an admin analytics dashboard are planned in later phases — see the project's saved plan for the full roadmap.

---

## 🚀 Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Postgres.** Create a free project at [neon.tech](https://neon.tech) (or point at any Postgres instance) and copy the connection string.

3. **Configure environment variables.** Copy `.env.example` to `.env.local` and fill in:
   ```
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="..."   # generate with: npx auth secret
   ```

4. **Create the database schema**
   ```bash
   npm run db:migrate
   ```

5. **Seed sample data** (bootstrap admin, departments, subjects, teachers, a notice)
   ```bash
   npm run db:seed
   ```
   The seed script prints the admin and a sample teacher's login credentials to the console — **change these passwords after your first sign-in.**

6. **Run the dev server**
   ```bash
   npm run dev
   ```

### Useful scripts

| Command | Purpose |
|---|---|
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Re-seed sample data |
| `npm run db:reset` | Drop, re-migrate, and re-seed (fresh demo state) |
| `npm run db:studio` | Open Prisma Studio to browse the database |

There is no self-registration — admin accounts come from the seed script, and teacher accounts are created by an admin from `/admin/teachers/new`.
