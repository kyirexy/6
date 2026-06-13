# Design System

## Color Palette

### Backgrounds
- `--bg-primary: #0a0a0f` - Deep dark base
- `--bg-secondary: #12121a` - Card backgrounds
- `--bg-elevated: #1a1a25` - Elevated surfaces

### Text
- `--text-primary: #f0f0f5` - Primary text (95% opacity)
- `--text-secondary: #a0a0b0` - Secondary text
- `--text-muted: #606070` - Muted/disabled text

### Accents
- `--accent-emerald: #10b981` - Primary accent (CTA, links)
- `--accent-orange: #f97316` - Recipe cards
- `--accent-amber: #f59e0b` - History cards
- `--accent-rose: #f43f5e` - Product review cards
- `--accent-slate: #64748b` - General cards

### Glass Effects
- `--glass-bg: rgba(255, 255, 255, 0.03)` - Glass background
- `--glass-border: rgba(255, 255, 255, 0.06)` - Glass border
- `--glass-blur: 20px` - Backdrop blur

## Typography

### Font Stack
- Primary: Inter (variable, 100-900 weights)
- Fallback: system-ui, -apple-system, sans-serif

### Scale
- H1: `text-3xl md:text-4xl` (30-36px) - font-extrabold
- H2: `text-xl md:text-2xl` (20-24px) - font-bold
- H3: `text-base md:text-lg` (16-18px) - font-semibold
- Body: `text-sm md:text-base` (14-16px) - font-normal
- Caption: `text-xs` (12px) - font-normal

### Line Length
- Max 65-75ch for body text
- Use `text-balance` on headings
- Use `text-pretty` on prose

## Spacing

- Container max-width: `max-w-6xl` (1152px)
- Section padding: `px-4 py-6 md:px-6 md:py-8`
- Card padding: `p-5 md:p-6`
- Gap between cards: `gap-3 md:gap-4`

## Components

### Glass Card
```css
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: 12px;
}
```

### Primary Button
```css
.btn-primary {
  background: var(--accent-emerald);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #059669;
  transform: translateY(-1px);
}
```

### Input Field
```css
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--text-primary);
}
```

## Motion

- Duration: 200ms for micro-interactions, 300ms for transitions
- Easing: `ease-out` for entrances, `ease-in` for exits
- Hover scale: `scale-[1.02]` for cards
- Stagger: 80ms per item in lists

## Responsive Breakpoints

- Mobile: < 640px (default)
- Tablet: `sm:` 640px+
- Desktop: `md:` 768px+
- Large: `lg:` 1024px+

## Z-Index Scale

- Dropdown: 50
- Sticky header: 50
- Modal backdrop: 100
- Modal: 100
- Toast: 200
