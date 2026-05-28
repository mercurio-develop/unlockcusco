# Responsive Premium Business Profile (Editorial Split)

## Background
The business profile page was successfully refactored to be a highly effective, mobile-first experience. However, on larger screens (tablets and desktops), the single-column layout stretches too wide and doesn't utilize available horizontal space efficiently. We need to introduce a responsive "Editorial Split" layout for larger viewports.

## Scope
- Modify `src/app/[lang]/business/[slug]/page.tsx` to add responsive (`md:`, `lg:`) Tailwind classes.
- Create a two-column grid layout for desktop while maintaining the exact single-column stack on mobile.

## Design Details: The Editorial Split

### 1. Hero Gallery Constraint
- **Mobile:** Full viewport width (`w-screen`).
- **Desktop (`lg:`):** Constrained to a max-width container (`max-w-6xl mx-auto`), with rounded bottom corners (`lg:rounded-b-3xl`) to give it a "banner" or "featured card" feel rather than bleeding off the edges endlessly.

### 2. Main Grid Layout (`lg:grid lg:grid-cols-3`)
Everything below the hero section will be wrapped in a max-width container (`max-w-6xl mx-auto`) and split into a 3-column grid on large screens.

#### Left Column: Main Content (`lg:col-span-2`)
This column takes up 2/3 of the width and contains the core reading experience:
- **Header Section:** Title, associative badge, location, and description. On mobile, this has a negative top margin (`-mt-6`) and rounded top corners to overlap the image. On desktop, this will flow naturally (`lg:mt-0 lg:rounded-none`).
- **Dynamic Category Body:** The rendering of `GastronomicTemplate`, `ExpeditionTemplate`, etc. remains identical.
- **Reviews Section:** Unchanged, flows sequentially.

#### Right Column: Sticky Action Card (`lg:col-span-1`)
This is a new element visible *only* on desktop/tablet (`hidden lg:block`).
- **Positioning:** Uses `sticky top-24` so it stays in the viewport as the user scrolls down through the long descriptions or menus on the left.
- **Content:**
  - A clean, bordered card (`bg-white rounded-2xl shadow-sm border border-slate-100 p-6`).
  - **Trust Signal:** Displays the prominent star rating and review count at the top of the card.
  - **Primary CTA:** Contains a larger version of the WhatsApp button, styled with the business's `primaryColor`.
  - **Secondary Info:** Opening hours or generic "Usually replies within 1 hour" trust text below the button.

### 3. Mobile Fallbacks
- The left column content flows 100% width.
- The right column (Sticky Action Card) is `hidden`.
- The original Sticky Action Bar (fixed at the bottom of the screen) remains active, but is hidden on desktop (`lg:hidden`).

## Technical Implementation Notes
- No changes required for the template files in `src/features/discovery/components/templates/`. The CSS Grid will automatically constrain their width.
- Use Tailwind's `lg:` prefix strictly for the desktop split to ensure the base (mobile) design remains completely unaffected.