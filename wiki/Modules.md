# Module Breakdown & Architecture

Reposhield uses a strict **Feature-Module Architecture** to keep the Next.js `app/` directory clean and maintainable. Instead of mixing UI components, database calls, and AI logic in the same files, everything is separated by domain.

---

##  Global Directory Structure

```text
reposhield/
├── app/                  # Next.js App Router (UI Routes & API endpoints)
├── components/           # Generic, reusable UI components (Buttons, Inputs, Modals)
├── inngest/              # Background job orchestrators and queue logic
├── lib/                  # Global utilities (Auth instance, Prisma client, Pinecone client)
├── module/               #  Core Business Logic (The brain of the app)
├── prisma/               # Database schema and migration histories
├── public/               # Static assets (images, SVGs)
└── wiki/                 # Project documentation
```

---

##  The `/module` Directory (File-by-File Breakdown)

The `/module` directory is the most important part of the codebase. It contains specific folders for each major feature. UI components can import from `module/`, but `module/` should **never** import UI components.

### 1. `module/ai/` (The Generative & RAG Brain)
Handles everything related to Large Language Models and Vector Search.
- **`actions/index.ts`**: Contains the `reviewPullRequest()` Server Action. This acts as the gatekeeper. When triggered, it checks the user's `UserUsage` table in Prisma. If they have sufficient quota, it dispatches the `github/pr.review` Inngest event. If not, it throws a quota error.
- **`lib/rag.ts`**: The heaviest math file in the project. 
  - Contains `generateEmbeddings()` which calls the `text-embedding-004` Gemini model.
  - Contains `upsertToPinecone()` which formats the vectors and pushes them to the Pinecone index.
  - Contains `queryCodebaseContext()` which takes new PR code, turns it into a vector, and queries Pinecone for the Top 5 most semantically similar files to inject into the LLM prompt.

### 2. `module/payment/` (Monetization & Quotas)
Isolates all Polar.sh checkout logic and usage limits.
- **`action/index.ts`**: Contains `syncSubscriptionStatus()`. Because webhooks can sometimes fail, this function is called manually by the frontend after a user upgrades. It uses the Polar SDK to fetch the user's active subscriptions and hard-updates the `subscriptionTier` in Prisma.
- **`config/polar.ts`**: A singleton file that initializes the official `@polar-sh/sdk` client using the `POLAR_ACCESS_TOKEN`.
- **`lib/subscription.ts`**: The strict business rules engine.
  - Contains `canConnectRepository(userId)`: Returns false if a FREE user has >= 5 repos.
  - Contains `canCreateReview(userId, repoId)`: Returns false if a FREE user has >= 5 reviews for that specific repo.

### 3. `module/dashboard/` (Data Aggregation)
Powers the analytics and UI data calculations.
- **`actions/insights.ts`**: The analytics engine. Contains `getDeveloperInsights()`. It queries Prisma for all `Review` records. It normalizes dates using `setUTCHours(0,0,0,0)` to ensure accurate Recharts rendering regardless of server timezone. It also runs keyword heuristics against the AI Markdown text to award Gamification Badges (e.g., matching the word "SQL Injection" to the "Security Guardian" badge).
- **`actions/index.ts`**: Simple data fetchers like `getRecentReviews()` and `getActiveRepositories()` to populate the dashboard tables.
- **`components/contribution-graph.tsx`**: A Recharts client component that takes the data from `insights.ts` and renders the interactive 7-day or 30-day activity trend line.

### 4. `module/github/` (External Integrations)
Handles direct communication with the GitHub API.
- **`lib/github.ts`**: Initializes the `Octokit` client using the GitHub App Private Key. 
  - Contains `fetchPullRequestDiff()`: Downloads the `.patch` file of the PR.
  - Contains `postPullRequestComment()`: Takes the final generated Markdown string from Gemini and posts it directly to the GitHub PR timeline via the REST API.

### 5. `module/auth/` (Session Management)
Handles user login states and UI buttons.
- **`components/login-ui.tsx` & `logout.tsx`**: Reusable React components containing the buttons that trigger Better Auth's `signIn.social({ provider: 'github' })` methods.
- **`utils/auth-utils.ts`**: Helper functions like `requireAuth()`. These are used inside other Server Actions to quickly extract the active session cookie and verify the user is logged in before executing sensitive database queries.

### 6. `module/repository/` (Onboarding Codebases)
Handles the process of linking a user's GitHub repositories to Reposhield.
- **`actions/index.ts`**: Contains `linkRepository()`. It takes a GitHub repo ID, verifies the user owns it, and saves a new `Repository` record in Prisma. It then triggers the `github/repo.index` Inngest event to start generating vector embeddings.
- **`hooks/use-connect-repository.ts`**: A React hook used in the UI. It manages the `isLoading` and `error` states while the user waits for the repository to be linked and indexed in the background.

---

##  Interaction Flows (How it all connects)

Reposhield relies on a strict flow of data between these modules to keep the UI fast while handling heavy AI computations in the background.

### 1. UI to Server Actions (The Dashboard Flow)
- **Flow**: `InsightsPage` UI -> calls `module/dashboard/actions/getDeveloperInsights()` -> queries Prisma -> returns data to UI.
- **Core Rule**: UI components *never* talk directly to the database.

### 2. Webhooks to Background Workers (The Event Flow)
- **Flow**: GitHub fires webhook -> `/api/webhooks/github` validates signature -> dispatches event via Inngest client -> immediately returns `200 OK`.
- **Handoff**: The Inngest server triggers the `generateReview` function on a separate thread.

### 3. The AI Review Pipeline (The Processing Flow)
Inside the Inngest background worker:
- **Interaction 1 (Fetch)**: Uses `module/github/lib/github.ts` to fetch the `.patch` diff.
- **Interaction 2 (RAG)**: Uses `module/ai/lib/rag.ts` to query Pinecone for the 5 most relevant codebase files.
- **Interaction 3 (Generation)**: Combines Diff + RAG Context and calls Gemini.
- **Interaction 4 (Commenting)**: Uses `module/github/lib/github.ts` to post the AI review back to GitHub.

### 4. Subscription State Syncing (The Payment Flow)
- **Interaction**: Polar.sh webhook hits `/api/webhooks/polar` -> updates `subscriptionTier` in Prisma.
- **Failsafe**: If webhook fails, frontend calls `module/payment/action/syncSubscriptionStatus()` to manually fetch status from Polar.sh API and hard-update the database.
