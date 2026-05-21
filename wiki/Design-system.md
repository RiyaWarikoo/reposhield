# Design System
Reposhield uses a sleek, modern UI designed to be readable and fast. Our frontend architecture is built on a standard, highly maintainable stack.
## Core Technologies
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI (accessible, unstyled components we have customized).
- **Icons**: Lucide React
- **Charts**: Recharts (for the Developer Insights dashboard).
## Color Palette & Theming
We support full Light and Dark mode using Tailwind's `dark:` classes and Next-Themes. 
- **Primary**: A vibrant blue used for main call-to-actions and active states.
- **Background (Dark)**: Deep Slate (`bg-slate-950`) to reduce eye strain for developers.
- **Background (Light)**: Off-white (`bg-slate-50`) for clean contrast.
## Gamification & Badge Colors
Colors carry semantic meaning across the application, especially in the Insights dashboard:
-  **Red (Destructive)**: Security vulnerabilities or production hazards.
- 🟡 **Yellow (Warning)**: Performance bottlenecks or architectural anti-patterns.
- 🟢 **Green (Success)**: Clean code, optimizations, and flawless reviews.
## Typography
We utilize the default system fonts (Inter/San Francisco) to ensure the dashboard feels native and snappy on any OS. Monospaced fonts (`font-mono`) are strictly reserved for displaying code snippets and commit hashes.
