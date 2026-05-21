# Contributing to Reposhield

First off, thank you for considering contributing to Reposhield! We welcome contributions from everyone, whether it's fixing a typo, adding a new feature, or improving the AI prompts.

---

## How to Contribute

### 1. Find an Issue
Check out the **Issues** tab on GitHub. Look for tags like `good first issue` or `help wanted`. If you have a new idea, please open an issue to discuss it before you start coding to ensure it aligns with the project's goals and architecture.

### 2. Fork and Clone
Fork the repository to your own GitHub account, then clone it locally:
```bash
git clone https://github.com/YOUR_USERNAME/reposhield.git
cd reposhield
```

### 3. Branch Naming Conventions
We use strict branch naming to keep our tracking clean:
- `feat/your-feature-name` (For new features)
- `fix/issue-description` (For bug fixes)
- `docs/updating-readme` (For documentation only)
```bash
git checkout -b feat/your-feature-name
```

### 4. Local Setup
Follow the steps in the [Installation Guide](Installation) to get your local database, Inngest server, ngrok tunnel, and Next.js app running.

### 5. Make Your Changes
- **Keep it focused**: Try to keep your Pull Requests limited to a single feature or bug fix. Massive PRs are harder to review.
- **Type Safety**: Ensure your TypeScript types are perfectly accurate. 
  - **Never** use `any`.
  - If you absolutely must bypass a compiler error, use `@ts-expect-error` with an explanation comment, *never* `@ts-ignore`.

### 6. Commit Your Changes
We strictly enforce **Conventional Commits** to auto-generate our changelogs.
- `feat: add new dashboard chart`
- `fix: resolve auth cookie expiration`
- `docs: update deployment guide`
- `refactor: move AI prompts to module folder`

### 7. Submit a Pull Request
1. Push your branch to your fork.
2. Open a Pull Request against the `main` branch of the official Reposhield repo.
3. Provide a clear description of what you changed, why you changed it, and include screenshots if you modified the UI.

** Note**: Since you are contributing to Reposhield... Reposhield itself will automatically review your Pull Request! Please wait 1-2 minutes for the bot to post its feedback, and address any security or performance concerns it raises before requesting a human review.

---

## Coding Style & Architecture Guidelines

To maintain a clean codebase, any PR that violates these architectural rules will be rejected:

- **Component Colocation**: Place generic, reusable UI pieces in `/components` (we use Shadcn UI).
- **The Feature-Module Rule**: All business logic that talks to Prisma Database or external APIs MUST live inside `/module/.../actions`. 
  - **Never** write a raw Prisma query directly inside a React UI component in the `/app` directory.
- **Icons**: We strictly use `lucide-react`.
- **Styling**: We strictly use Tailwind CSS utility classes. Avoid writing custom standard CSS or external stylesheets unless absolutely necessary for complex animations.
- **Data Fetching**: We prefer React Server Components and Next.js Server Actions over standard `useEffect` client-side fetching whenever possible.
