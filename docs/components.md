---
description: UI component patterns
paths:
  - app/design-system/**
  - app/features/**/components/**
---

# Component Conventions

## Styling

- Use Tailwind CSS utility classes — no CSS-in-JS or custom CSS
- Use `class-variance-authority` (CVA): `cva()` for variant definitions, `cx()` for conditional class merging
- Do not use `clsx` or `twMerge` — use `cx()` from CVA
- Mobile-first responsive: `sm:`, `md:`, `lg:` breakpoints
- Indigo primary brand color (`bg-indigo-600`, `focus-visible:outline-indigo-600`)

## Design System (`app/design-system/`)

- Reusable UI components in `app/design-system/`, organized: `forms/`, `layouts/`, `dialogs/`, `charts/`, `icons/`
- Import with `~/design-system/` path
- Named exports over default exports
- Separate styles into `*.styles.ts` when variant definitions are complex
- Export variant types: `export type ButtonStylesProps = VariantProps<typeof buttonStyles>`

## Component Patterns

- **Compound components** for complex UI: `Card.Title`, `Card.Content`, `Card.Actions`, `Modal.Content`, `List.Row`
- **Polymorphic components** with `as` prop for tag flexibility (e.g., `<Text as="span">`)
- Button: polymorphic, renders as `<button>`, React Router `<Link>`, or `<a>` based on props
- Prefer composition over prop drilling — extract sub-components when complexity grows

## HeadlessUI

- Use HeadlessUI (`@headlessui/react`) for all interactive components: dialogs, menus, listboxes, comboboxes, disclosures
- Wrap with custom Transition components for animations
- Menu positioning: `anchor={{ to: 'bottom end', gap: '8px' }}`
- Apply Tailwind classes directly to HeadlessUI components

## Icons

- Use `@heroicons/react` (16/solid, 20/solid, 24/outline) for standard icons
- Custom SVG icons in `app/design-system/icons/` for brand/social icons
- Always `aria-hidden="true"` on decorative icons
- Icon-only buttons must have `label` prop for screen reader accessibility

## Forms

- Use React Router `<Form>` with `method="POST"` for submissions
- Display field errors via `error` prop on input components
- Use `<Callout variant="error">` for form-level errors
- Form components: `Input`, `InputPassword`, `InputCheckbox`, `InputRadio`, `Select`, `MultiSelect`, `TextArea`, `MarkdownTextArea`, `DateRangeInput`, `TimeRangeInput`, `ColorPicker`, `CopyInput`, `SearchInput`

## Accessibility

- Semantic HTML first: `<label>`, `<fieldset>`, `<legend>`, `<button>`, `<ul>`/`<li>`
- `aria-invalid={Boolean(error)}` on form fields with errors
- `aria-describedby` to link fields to error/description text
- Icon-only elements need `<span className="sr-only">` for screen reader text
- `role="presentation"` on purely decorative elements

## Layout Components

- `<Page>` with `<Page.NavHeader>` and `<Page.Heading>` for page structure
- `<Card>` with rounded/padding variants and sub-components
- `<List>` with `<List.Row>`, `<List.RowLink>`, `<List.PaginationFooter>` for data lists
- `<Container>` for max-width content wrapping
- `<EmptyState>` for empty data displays

## Typography

- Use `<Text>` component with `variant`, `size`, `weight` props — not raw HTML tags
- Headings: `<H1>`, `<H2>`, `<H3>` with preset sizing
- `<Label>` for form labels, `<Subtitle>` for secondary text
- Truncate long text with `truncate` prop, not manual CSS
