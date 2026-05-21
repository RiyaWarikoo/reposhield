# API & Commands Reference

This document provides a comprehensive overview of the external webhook endpoints, internal Next.js Server Actions, background event payloads, and CLI commands used to operate Reposhield.

---

##  External Webhooks (API Routes)

These endpoints are exposed to the public internet but are strictly secured via cryptographic signature validation. They do not return HTML; they only accept `POST` requests and return JSON.

### `POST /api/webhooks/github`
- **Purpose**: Receives real-time repository events directly from GitHub (e.g., when a Pull Request is opened or synchronized).
- **Security**: Validates the `x-hub-signature-256` header using the `GITHUB_WEBHOOK_SECRET`.
- **Execution Flow**: 
  1. Parses the GitHub payload.
  2. Verifies the user has an active PRO subscription or has not exceeded FREE tier limits.
  3. Dispatches the `github/pr.review` event to the Inngest queue.
  4. Immediately returns `200 OK` to prevent GitHub webhook timeouts.

### `POST /api/webhooks/polar`
- **Purpose**: Receives asynchronous billing, checkout, and subscription lifecycle events from Polar.sh.
- **Security**: Validates the webhook signature using the `POLAR_WEBHOOK_SECRET` via the official `@polar-sh/sdk`.
- **Execution Flow**:
  1. Listens for `subscription.created` or `subscription.updated`.
  2. Extracts the `polarCustomerId` and `subscriptionTier`.
  3. Updates the `User` record in the database, automatically granting or revoking PRO status.

### `GET/POST /api/inngest`
- **Purpose**: The bridge between the Vercel serverless environment and the Inngest orchestration engine.
- **Behavior**: Hosted by Next.js but invoked exclusively by Inngest infrastructure to execute the step-by-step background functions defined in `/inngest/functions`.

---

##  Internal API (Next.js Server Actions)

Instead of traditional REST API routes (`/api/users`), Reposhield utilizes Next.js **Server Actions** for all frontend-to-backend communication. These are imported directly into React components.

### `syncSubscriptionStatus()`
- **Location**: `/module/payment/action/index.ts`
- **Purpose**: Manually forces a synchronization with Polar.sh. Used on the Dashboard when a user clicks "Sync Status" after a checkout.
- **Returns**: `{ status: "ACTIVE" | "INACTIVE", tier: "FREE" | "PRO" }`

### `getDeveloperInsights()`
- **Location**: `/module/dashboard/actions/insights.ts`
- **Purpose**: Aggregates all code reviews for a user and calculates gamification metrics.
- **Behavior**: Uses `setUTCHours(0,0,0,0)` to group review counts by day, ensuring timezone-independent charting in Recharts. Also triggers the `analyzeReviewForBadges` heuristic.

### `reviewPullRequest()`
- **Location**: `/module/ai/actions/index.ts`
- **Purpose**: The manual trigger to review a PR if the webhook fails. It checks usage limits before queueing the Inngest job.

---

##  Background Events (Inngest Payloads)

Inngest relies on strictly typed event names and payloads to trigger background workers.

### `github/pr.review`
- **Payload**: 
  ```json
  {
    "data": {
      "repoId": "cuid_123",
      "prNumber": 42,
      "installationId": "98765432"
    }
  }
  ```
- **Description**: Triggers the massive AI review pipeline. Steps include: fetching the diff via Octokit, searching Pinecone for RAG context, and calling the Gemini Generative AI model.

### `github/repo.index` (Internal Engine)
- **Payload**: 
  ```json
  {
    "data": {
      "repoId": "cuid_123",
      "installationId": "98765432"
    }
  }
  ```
- **Description**: Triggers the background codebase indexing pipeline. Downloads the repo, splits text into overlapping chunks, creates vector embeddings via Gemini, and upserts them into Pinecone.

---

##  Prisma Database Commands

When developing locally or managing the production database, these are the core commands:

- `bunx prisma generate`: **(Critical)** Run this every time you modify `schema.prisma`. It updates the TypeScript types for auto-completion.
- `bunx prisma db push`: Pushes schema changes directly to the database without creating a formal migration file. (Used for rapid local prototyping).
- `bunx prisma migrate dev`: Creates a formal, version-controlled `.sql` migration file and applies it. (Used before pushing to production).
- `bunx prisma studio`: Opens a local web UI on port `5555` to manually inspect, edit, and delete raw database records.
