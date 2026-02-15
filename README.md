# GAA Referee Log

Log your GAA football and hurling matches, track report submission, and at year-end compare your log with the admin’s Excel spreadsheet so you can chase any missing payments.

## Features

- **Log matches** – Sport, date, competition, teams, location, scores (or Game Off / Conceded / Fixture with reason). Report submitted defaults to No; mark as submitted after you email the report.
- **Pending reports** – Filter to matches that were played but report not yet submitted; one-tap to mark as submitted.
- **Compare with admin** – Upload the year-end Excel file (REFEREES FIXTURES STATEMENT). See: in your log but not in admin (chase payment), in admin but not in your log, and report status mismatches. Call-offs are included (you get paid for last-minute call-offs too).
- **Export** – Download your data as JSON or CSV for backup.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build and deploy (e.g. Vercel)

```bash
npm run build
```

Deploy the `dist` folder. On Vercel: connect this repo, build command `npm run build`, output directory `dist`.

## Push to your GitHub

The remote is set to `https://github.com/gally74/rebel-og-referee-log.git`. If the repo doesn’t exist yet:

1. On GitHub go to [github.com/new](https://github.com/new), name it `rebel-og-referee-log`, leave it empty, create.
2. Then run: `git push -u origin master`
