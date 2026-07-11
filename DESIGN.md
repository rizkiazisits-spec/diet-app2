---
name: Premium Health & Diet
colors:
  surface: '#f6faff'
  surface-dim: '#d6dae0'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fa'
  surface-container: '#eaeef4'
  surface-container-high: '#e4e8ee'
  surface-container-highest: '#dee3e9'
  on-surface: '#171c20'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2c3135'
  inverse-on-surface: '#edf1f7'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#8a5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#de8712'
  on-tertiary-container: '#4d2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f6faff'
  on-background: '#171c20'
  surface-variant: '#dee3e9'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  text-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  text-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1.25rem
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
---

## Brand & Style
The design system is anchored in a high-end clinical-meets-lifestyle aesthetic. It targets health-conscious individuals who value precision, clarity, and a professional interface that feels like a premium medical-wellness tool. 

The style is **Corporate Modern with Minimalist influences**, focusing on high-contrast data visualization and generous negative space to reduce the cognitive load of diet tracking. The interface prioritizes clarity through a structured layout, subtle depth, and a vibrant primary accent that directs user attention to key health actions.

## Colors
The palette is designed for high legibility and professional rigor. 

- **Primary Blue:** Used for primary actions, progress indicators, and active states.
- **Dark Slate:** Utilized for high-contrast navigation elements and primary typography to provide a grounded, premium feel.
- **Functional Colors:** Success Green is strictly for positive health outcomes (calorie deficit, goal completion), while Danger Red is reserved for surplus warnings or critical health metrics.
- **Surfaces:** In light mode, subtle grey backgrounds differentiate the canvas from white elevated cards. In dark mode, a deep black background ensures maximum contrast for OLED displays and reduces night-time eye strain.

## Typography
This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian, and clean appearance. 

- **Weight Usage:** Use Bold (700) for large calorie/macro numbers and Semi-Bold (600) for section headers. Regular (400) is reserved for body descriptions and secondary metadata.
- **Scaling:** For mobile devices, display sizes are reduced to ensure nutrient data and titles do not wrap awkwardly. 
- **Hierarchy:** Use the `label-md` uppercase style for small categories like "Breakfast," "Lunch," or "Dinner" to provide a clear structural anchor.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on vertical stack rhythm.

- **Margins:** A standard 20px (1.25rem) side margin is maintained across all mobile views.
- **Rhythm:** An 8pt grid system guides all spacing. Use `stack-sm` (8px) for related elements (e.g., a label and its input), and `stack-lg` (24px) to separate distinct content blocks or cards.
- **Responsive:** On tablet and desktop, cards should transition into a multi-column masonry or grid layout to prevent line lengths from becoming unreadable.

## Elevation & Depth
Hierarchy is established through **Ambient Shadows** and tonal layering.

- **Shadow Profile:** Cards utilize a medium shadow (`0 4px 12px rgba(0,0,0,0.08)`) to appear gently lifted from the background. This creates a tactile feel that suggests the cards can be interacted with or swiped.
- **Dark Mode Elevation:** In dark mode, shadows are disabled. Instead, depth is communicated through "Tonal Layers"—the background is the darkest surface (#0A0A0A), and cards use a lighter grey (#1E1E1E) to signify elevation.
- **Interactions:** When pressed, buttons and cards should slightly scale down (98%) rather than increasing shadow depth, reinforcing the high-end, responsive feel.

## Shapes
The shape language combines approachable softness with professional precision.

- **Cards:** 16px (rounded-2xl) corner radius is the standard for all primary containers, creating a friendly, modern "app-like" feel.
- **Buttons:** 100% pill-shaped (rounded-full). This distinction ensures that interactive triggers are never confused with content containers.
- **Small Elements:** Tooltips and small badges should use 8px (rounded-lg) to maintain consistency without appearing overly circular at small scales.

## Components
- **Buttons:** Primary buttons are pill-shaped with a solid #0EA5E9 fill. Secondary buttons use a Slate Grey outline with a transparent background.
- **Cards:** White surfaces in light mode with 16px radius and `shadow-md`. Use cards to group meal entries, weight progress, or daily summaries.
- **Chips:** Small, pill-shaped tags used for macro breakdown (e.g., "High Protein," "Low Carb") using low-opacity primary or secondary tints.
- **Lists:** Clean, borderless list items separated by subtle dividers or 8px vertical spacing. Each list item should have a clear trailing icon (e.g., "+" or ">").
- **Inputs:** Clean, outlined fields with a 12px radius. On focus, the border transitions to Primary Blue with a subtle 2px glow.
- **Progress Rings:** High-stroke circular indicators for daily calorie intake, using the Success and Danger colors to signify status relative to the target.
- **Bottom Navigation:** Solid #0F172A background with active icons highlighted in Primary Blue.