# babyPM — Concept Prototype

This is a working demo of four of the highest-value workflows described in the CWW
babyPM RFP: **Knowledge Q&A**, **Weekly Report drafting**, **Email drafting**, and a
**Tender Compliance Matrix** (which literally analyses the CWW RFP itself).

**Important — read this first:** this is a fast concept prototype built on GitHub +
Supabase + Vercel so it can be demoed quickly. It is **not** the architecture being
proposed for production. The RFP explicitly asks for a Microsoft 365 / Azure OpenAI
aligned solution with Australian data hosting (Sections 5 and 6) — that's what should
go in the actual written proposal. This prototype exists to prove the workflow concepts
(RAG with citations, structured reporting, tone control, compliance mapping) are sound
and feel right, fast, before committing to the heavier Azure build. The page itself
says this too, so nobody mistakes the demo for the real thing.

No real CWW data is in here. The sample "knowledge base" documents are clearly-labelled
illustrative content (see `supabase/schema.sql`), and the rest of the demo runs on
whatever you type into it.

---

## What you'll need

1. A **GitHub** account (free) — to hold the code.
2. A **Vercel** account (free, sign in with GitHub) — to host the live site.
3. A **Supabase** account (free) — for the small sample knowledge base and the lead
   capture form.
4. An **Anthropic API key** — at https://console.anthropic.com, under "API Keys."
   This is a paid-as-you-go key (separate from a claude.ai subscription). The demo
   uses it to generate the report drafts, email rewrites, etc.

Everything below is done in a web browser. No installing anything on your computer.

---

## Step 1 — Put the code on GitHub

1. Go to https://github.com and click the **+** in the top right → **New repository**.
2. Name it something like `babypm-demo`. Keep it **Private** (recommended, since it's
   a client pitch asset). Click **Create repository**.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in every file and folder from this project (keep the folder structure —
   `app/`, `lib/`, `components/`, `supabase/`, and the files in the root like
   `package.json`).
5. Click **Commit changes**.

(If GitHub's web uploader struggles with nested folders, zip the project, then use
GitHub's "Add file → Upload files" and drop the zip — GitHub will ask if you want it
unzipped. If not, ask me and I'll walk through the alternative.)

## Step 2 — Set up Supabase (the knowledge base + lead form)

1. Go to https://supabase.com → **New project**.
2. Pick a name, set a database password (save it somewhere), and **choose the Sydney
   (ap-southeast-2) region** if data residency matters to you for this demo too.
3. Once the project is ready, go to **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this project, copy all of it, paste it into the
   query box, and click **Run**. This creates the two tables and loads the sample
   knowledge base content.
5. Go to **Project Settings → API**. You'll need two values for the next step:
   - **Project URL**
   - **service_role key** (under "Project API keys" — keep this one secret, it has
     full access; never put it in frontend code, only in Vercel's environment
     variables as set up below)

## Step 3 — Deploy to Vercel

1. Go to https://vercel.com → **Add New → Project**.
2. Choose **Import** next to the GitHub repo you created in Step 1.
3. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | your Anthropic API key from console.anthropic.com |
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL from Supabase Step 2 |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key from Supabase Step 2 |

   (`ANTHROPIC_MODEL` is optional — leave it out and it defaults to
   `claude-sonnet-4-6`.)

4. Click **Deploy**. After a minute or two you'll get a live URL like
   `babypm-demo.vercel.app` — that's what you'd show CWW.

If you ever need to change an environment variable later, it's under your Vercel
project → **Settings → Environment Variables**, then **Deployments → Redeploy** to
pick up the change.

---

## What's real vs. illustrative in this demo

- **Real:** the chat interactions actually call Claude; the Knowledge Q&A mode does
  real retrieval against the Supabase table (full-text search) and only answers from
  what it finds, citing sources; the lead capture form really saves to Supabase.
- **Illustrative / sample:** the four seeded "knowledge base" documents (a sample
  report template and two anonymised sample case studies) are placeholder content,
  not real CWW deliverables — swap them for real, permissioned CWW artefacts before
  this becomes anything more than a concept demo.

## Before this goes beyond a pitch demo

- Run `npm audit` and update dependencies — `next` and a couple of its dependencies
  have had security patches in the last few months; this demo is pinned to a patched
  Next.js 14 release as of today, but check again before any wider use.
- Don't store real client/government information in the Supabase tables used here —
  this stack wasn't built to satisfy the RFP's Australia-hosting-only and
  Microsoft-365-alignment requirements; treat it as a sales/concept tool only.
- The lead form and knowledge base currently allow open access via the API key set
  in Vercel — fine for an internal pitch demo behind a private URL, but add proper
  auth before sharing the link broadly.

---

## Local development (optional, only if you want to run it on your own machine)

```
npm install
cp .env.example .env.local   # then fill in the three values
npm run dev
```

Open http://localhost:3000.
