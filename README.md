# Mulecraft-office-reports

The Employee Monthly Reporting & Compliance Portal is a web-based application designed to centralize and manage a company's employee, attendance, working hours, leave, employment, wage, and statutory information in one system.

## Current status

UI-only prototype for the HR team. All pages render with mock data (in `src/data/mock.js`) and support add/edit/delete in the browser. No backend is wired yet.

## Pages

- Dashboard — overview stats and recently added employees
- Employees — list, add, edit, delete, and per-employee detail view
- Attendance — daily records with check-in/out and hours
- Working Hours — period summaries with overtime
- Leave — requests with approve/reject workflow
- Wages — salary components and pay frequency
- Statutory — PAN, Aadhaar, UAN, PF, ESI, bank details, tax regime
- Monthly Reports — aggregated monthly snapshot per employee

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Next steps (backend)

The app was originally scaffolded to connect to Supabase (`https://nmvtcqculovobamtcbfc.supabase.co`). To wire it up later:

1. Create the tables by running `supabase/schema.sql` in the Supabase SQL Editor (or via `supabase db push`).
2. Add your credentials to a local `.env` file (git-ignored):
   ```
   VITE_SUPABASE_URL=https://nmvtcqculovobamtcbfc.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
3. Replace the mock-data imports in `src/pages/*` with Supabase queries (the original Supabase-based page implementations are a good starting point).
