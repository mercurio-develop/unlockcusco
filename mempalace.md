# Memory Palace

Centralized context repo (Memory Palace) for INKAPORTAL. Compressible for token savings.

## Architecture
- Next.js 16.2.4 App Router
- Prisma + SQLite
- Tailwind CSS v4, Framer Motion
- Mapbox GL JS

## Goals
- Compressed technical context for AI agents.
- Feature-Sliced Architecture enforced.
- Single source of truth for constraints + roadmap.

## Theme & Design System
- **Global Feel**: Clean, rich aesthetics, light mode by default.
- **Backgrounds**: White (`bg-white`) and Off-White (`bg-gray-50`) with subtle gradients/vignettes.
- **Typography**: Serif fonts (`font-serif`) for large display headings (e.g., hero text). Sans-serif (`text-slate-900`, `text-slate-500`) for standard UI elements.
- **Base Color (Slate 900)**: Used for primary dark buttons ("Book Now"), heavy text, and high-contrast UI details.
- **Accent Color (Rose 600)**: Used for CTAs ("Send Inquiry"), highlights, verified badges, and decorative eyebrow text.
- **Interactions**: Smooth scaling on hover (`hover:scale-105`), subtle shadows (`shadow-sm`, `shadow-rose-600/50`), and glassmorphism elements (`backdrop-blur-md`).