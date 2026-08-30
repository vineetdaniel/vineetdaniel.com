# Blog Agents

AI agents that research topics and draft blog posts on Vineet's behalf, using
[Grok](https://x.ai/api) (xAI) for research + writing and the site's own
`/api/posts` endpoint for publishing.

## Files

| File            | Role                                                             |
| --------------- | ---------------------------------------------------------------- |
| `grok.ts`       | Calls Grok with Live Web Search; writes the post + metadata.     |
| `publish.ts`    | Sends the draft to `POST /api/posts` (draft by default).         |
| `draft-post.ts` | CLI entry point: research → write → create draft.                |
| `topic.ts`      | Picks a trending topic via Grok web search, deduped vs the site. |
| `notify.ts`     | Emails the daily digest via Resend.                              |
| `auto-draft.ts` | Cloud entry: pick topic → write → save draft → email digest.     |
| `topics.md`     | Topic queue. `--next` picks the first unchecked `- [ ]` item.    |

## Setup

Add to `.env.local`:

```
XAI_API_KEY="xai-..."          # from https://console.x.ai
API_SECRET="..."               # same secret your /api/posts checks
SITE_API_URL="http://localhost:3000"   # or your production URL
XAI_MODEL="grok-4-6"           # optional, this is the default
```

## Usage

The dev server (or a deployed site) must be running so the agent can POST to it.

```bash
# Draft a specific topic (creates an UNPUBLISHED draft you review)
npm run agent:draft -- "The Generalist Advantage in an AI-first world"

# Draft the next queued topic from topics.md
npm run agent:draft -- --next

# Research, write, AND publish live in one go
npm run agent:draft -- --publish "How I think about cyber hygiene"
```

## Workflow (recommended)

1. Run the agent → it creates a **draft** (`published: false`), not public.
2. Review the draft (via Prisma Studio `npm run db:studio`, or fetch it:
   `curl -H "x-api-key: $API_SECRET" $SITE_API_URL/api/posts/<slug>`).
3. Publish it:
   `curl -X PUT "$SITE_API_URL/api/posts/<slug>" -H "x-api-key: $API_SECRET" \
     -H "Content-Type: application/json" -d '{"published": true}'`

Keeping a human in the loop protects your voice and accuracy. Once you trust
the pipeline, use `--publish` or wire `--next` into a scheduled GitHub Action.

## Daily auto-draft (fully cloud — GitHub Actions)

The site drafts itself every day at **09:00 IST** via
[`.github/workflows/daily-draft.yml`](../.github/workflows/daily-draft.yml).
No laptop or local state is involved — the runner checks out the repo, picks a
trending topic with Grok web search (deduped against the live site), writes
and edits the post, saves it as an **unpublished draft**, and emails you a
detailed digest. You review and publish from the admin panel.

```
GitHub Actions (cron) → topic.ts (Grok search + dedupe) → writePost (research → write → editor)
                      → publishDraft({ published: false }) → notify.ts (Resend email)
```

### One-time setup

1. Create a [Resend](https://resend.com) account → API key (free tier covers this).
2. Repo → **Settings → Secrets and variables → Actions** and add:

   | Secret          | Value                                        |
   | --------------- | -------------------------------------------- |
   | `XAI_API_KEY`   | xAI key (required; provides live web search) |
   | `API_SECRET`    | same secret your `/api/posts` checks         |
   | `RESEND_API_KEY`| Resend API key                               |
   | `SITE_API_URL`  | `https://www.vineetdaniel.com` *(Actions variable)* |
   | `NOTIFY_TO`     | `vineetdaniel@gmail.com` *(Actions variable)* |

   Optional secrets: `OLLAMA_API_KEY`, `GROQ_API_KEY`, `XAI_MODEL`.
   `NOTIFY_FROM` (variable) overrides the default `onboarding@resend.dev` sender
   once you verify a domain in Resend.

3. Push, then **Actions → Daily auto-draft → Run workflow** to test on demand.

### Local test

```bash
npm run agent:auto:local   # loads .env.local, runs the same pipeline
```

## Notes

- Grok's web search grounds current facts; still review for accuracy and tone.
- Consider adding an "AI-assisted" disclosure to posts drafted this way.
