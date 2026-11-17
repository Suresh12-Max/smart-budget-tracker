# Ledgerly - Smart Expense & Budget Tracker for Students

COMP.6207 Activity 2 practical prototype based on the approved Activity 1 topic for **Suresh Gunathilaka (30098806)**.

The application includes a student dashboard, monthly summaries, CRUD transaction management, categorisation, budget progress/warnings, expense charts, filtering and responsive design. Supabase mode enables email authentication and per-user records. **It does not connect to banks or process payments.**

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 works too)
- npm
- A browser
- For the complete authenticated version: a Supabase project that Suresh controls

## Quick local demonstration

1. Open a terminal in `smart-budget-tracker`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL shown, normally `http://localhost:5173`.

Without environment variables, the application opens in **local demo mode** with example fictional records. It supports transaction CRUD and budgets using that browser's `localStorage`. This is a UI demo, **not authenticated, isolated, cloud-backed or secure**. It is not sufficient evidence for Supabase authentication or Row Level Security.

## Full Supabase setup (required to match the proposal)

1. Sign in to [Supabase](https://supabase.com/) and create a project under Suresh's account.
2. Open the **SQL Editor** and run the contents of `supabase/schema.sql`. The script creates the two tables and their Row Level Security policies.
3. Check **Authentication > Providers > Email** is enabled. Confirm the email verification setting. If confirmation is on, verify an account's email before login.
4. In **Project settings / API Keys**, copy the project URL and publishable (or legacy anon) key. **Never copy the service_role/secret key into this frontend.**
5. Duplicate `.env.example` to `.env` and replace placeholders with the project's values:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```

6. Restart `npm run dev` after editing `.env`.
7. Register with a fictional test email you control, confirm it if required, and log in.
8. Add/edit/delete records, set a budget, refresh the page and confirm persistence.
9. Register a second separate test account and verify it cannot see or edit the first account's data. Check Supabase **Table Editor** and **Policies**; take authentic screenshots for the report.
10. Run `npm test` and `npm run build`. You may deploy `dist/` via Netlify after updating Supabase's allowed redirect/site URL configuration.

If the web app shows `relation ... does not exist`, the SQL has not been run in the right project. If sign-up says email confirmation is needed, complete it using your own mailbox. If data is empty after sign-in, first confirm the insert succeeded and that RLS policies exist.

## Features and screens

| Screen | Function |
| --- | --- |
| Overview | Monthly totals, income, expenses, balance, budget left, chart and recent records |
| Transactions | Add, edit, delete, search and filter income/expense records |
| My budget | One expense limit per calendar month and progress monitor |
| Insights | Category ranking and spending chart |
| Account settings | Current mode, identity and logout when authenticated |
| Authentication | Email sign-up, sign-in and sign-out (Supabase mode only) |

## Calculations and design choices

- Income and expense totals use records whose `transaction_date` begins with the selected `YYYY-MM`.
- Balance = monthly income - monthly expenses.
- Remaining budget = monthly expense limit - monthly expenses.
- A warning appears once at least 80% of budget is consumed; negative remaining value indicates overspending.
- Monetary amounts are limited to 2 decimal places for input and `numeric(12,2)` in PostgreSQL.
- Security: policies require `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE. Frontend also scopes queries by the signed-in user. The **database policy** is the enforcement boundary.
- Uses no bank credentials; users enter fake test data for assessment.

## Tests

Run:

```bash
npm test
npm run build
```

Automated tests cover monthly aggregation, category breakdown, overspending, zero-budget logic and input validation. **Tests do not establish that remote Supabase authentication, RLS or deployment work**. Complete and record those manual checks in the final assessment before describing them as passed.

## Submission evidence checklist

- [ ] Cover page and Activity 2 research/design/testing report reviewed by Suresh
- [ ] App launched and basic operations demonstrated
- [ ] Supabase project configured and migration executed
- [ ] Registration/sign-in/sign-out screenshots captured
- [ ] Database table and RLS policy screenshots captured (no secrets visible)
- [ ] Two-account isolation test performed and documented
- [ ] Transaction create/edit/delete screenshots captured
- [ ] Budget and category chart screenshots captured
- [ ] `npm test` and `npm run build` outputs captured
- [ ] Mobile-responsive view tested and screenshot captured
- [ ] Screenshots inserted into final report with dates and descriptions
- [ ] Lecturer confirms final submission format and demonstration requirement

## Security and ethical notes

This is a university prototype and should not hold real financial information. Never commit `.env` or use a Supabase service-role key in the client. Obtain consent before user testing. Use fictional test entries. Passwords are handled by Supabase Auth and are not stored in the application tables. See OWASP ASVS and the Supabase RLS documentation for future hardening.

## Research references

- StudyLink: https://www.studylink.govt.nz/starting-study/thinking-about-study/cost-of-living.html
- Sorted money tracking: https://sorted.org.nz/guides/planning-and-budgeting/money-tracking/
- Sorted budget planner: https://sorted.org.nz/tools/budget-planner/
- React documentation: https://react.dev/learn
- Vite documentation: https://vite.dev/guide/
- Supabase React Auth: https://supabase.com/docs/guides/auth/quickstarts/react
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- OWASP ASVS: https://owasp.org/projects/asvs
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

Prepared as project support material. Suresh should understand, validate and accurately present the implementation, research and results as his own work.
# smart-budget-tracker
