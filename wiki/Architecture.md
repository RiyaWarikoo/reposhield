# System Architecture

Reposhield uses a modern, heavily event-driven architecture designed to be highly scalable, serverless-friendly, and resilient to third-party API rate limits.

## High-Level Tech Stack
- **Frontend & Core Framework**: Next.js 15 (App Router), React, Server Actions
- **Styling & UI**: Tailwind CSS, Shadcn UI, Recharts (for data visualization)
- **Authentication**: Better Auth (configured with GitHub OAuth providers)
- **Relational Database**: PostgreSQL (Neon.tech) managed via Prisma ORM
- **Vector Database**: Pinecone (for storing code embeddings and semantic search)
- **AI/LLM Engine**: Google Gemini (via Vercel AI SDK)
- **Background Orchestration**: Inngest (handles retries, delays, and stateful step execution)
- **Monetization**: Polar.sh (for webhook-driven subscription syncing)

---

## The Core Data Flow

When a developer opens a Pull Request on GitHub, a complex chain of events is triggered. Reposhield relies on the "Fire and Forget" webhook pattern to ensure GitHub never times out while waiting for the AI to finish reading the code.

```mermaid
flowchart TD
    U[Developer] -->|Opens PR| GITHUB[GitHub Repository]
    GITHUB -->|Fires Webhook| WEBHOOK[Next.js /api/webhook]
    WEBHOOK -->|Validates Signature & Dispatches| INNGEST_Q[Inngest Job Queue]
    WEBHOOK -->|Returns 200 OK immediately| GITHUB
    
    subgraph BackgroundWorker
        INNGEST_Q -->|github/pr.review| WORKER[Inngest State Machine]
        WORKER -->|Step 1: Fetch Diff| OCTOKIT[GitHub API]
        WORKER -->|Step 2: Generate Vector Query| EMBEDDING[Gemini Embedding Model]
        WORKER -->|Step 3: Search Context| VECTOR[(Pinecone Vector DB)]
        WORKER -->|Step 4: Prompt + Diff + Context| AI[Gemini Generative Model]
        AI -->|Generate Markdown Review| WORKER
    end

    WORKER -->|Post Comment via Octokit| GITHUB
    WORKER -->|Save Review History| DB[(PostgreSQL Database)]

    subgraph DashboardUI
        DB --> INSIGHTS[Next.js Server Actions]
        INSIGHTS --> UI[React Dashboard Charts & Badges]
        UI -->|Quota Enforcement| POLAR[Polar.sh Subscription Sync]
    end
```

---

## Deep Dive: The RAG Pipeline

Standard AI tools only look at the few lines of code changed in a Pull Request. Reposhield uses **Retrieval-Augmented Generation (RAG)** to understand the entire repository.

1. **Ingestion & Chunking**: When a repository is first linked, Reposhield downloads the codebase and splits it into logical "chunks" (e.g., function by function, or file by file).
2. **Vector Embeddings**: These chunks are sent to a Gemini Embedding model, which converts the text into mathematical vectors (arrays of floating-point numbers) representing the semantic meaning of the code. These are stored in Pinecone.
3. **Contextual Retrieval**: When a PR is opened, the system converts the *new* code into a vector and queries Pinecone for the 'nearest neighbors' (most mathematically similar code chunks).
4. **Prompt Injection**: The retrieved files are injected into the final LLM prompt, allowing the AI to say: *"I see you are updating the user schema here. Be careful, because this breaks the authentication logic located in `auth.ts`."*

---

## Deep Dive: Background Orchestration

Because AI generation and Vector searches are slow and prone to API rate-limiting, we cannot process reviews synchronously in the Next.js API route. 

We use **Inngest** to break the review process into discrete "Steps". If the Gemini API crashes or rate-limits us during Step 4, Inngest automatically pauses, waits, and retries *only* Step 4 without having to re-download the GitHub diff from Step 1. This guarantees that no Pull Request review is ever lost or silently failed.

---

## Codebase Structure: The Feature-Module Pattern

To prevent the Next.js `app/` directory from becoming bloated, Reposhield strictly adheres to a **Feature-Module** architecture. 

All business logic, database calls, and complex AI operations are isolated in the `/module` directory. The `/app` directory is kept completely "thin", only responsible for routing and rendering UI components.

- `/module/ai/`: Contains all prompt engineering, vector search logic, and LLM orchestration.
- `/module/payment/`: Isolates the Polar.sh logic, webhook syncing, and Free vs Pro tier checks.
- `/module/dashboard/`: Contains the Server Actions that calculate user insights, aggregate charts, and determine gamification badges.
