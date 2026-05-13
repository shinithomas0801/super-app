# UX Design Snapshot

This document captures the **current implemented UX** for the admin product.
It is descriptive (what exists now), not a future redesign spec.

## Product Entry

- Entry route is a module chooser (`/homepage`) with card-style tiles.
- Available modules:
  - Health Management
  - Education Management
  - Admin Management (shown only for super admins)
- Visual pattern:
  - Light-gray page background
  - White elevated cards with subtle border/shadow
  - Hover lift and shadow increase to signal clickability

## Education Module Shell

- All `/education/*` pages are wrapped by a consistent shell:
  - Left fixed-width side navigation
  - Main content area with centered max width and responsive padding
  - Top-right sign-out action in content header area
- The shell favors desktop-first information density and predictable placement.

## Education Navigation IA

The side nav groups routes by operational job-to-be-done:

- Overview
  - Dashboard
- Student data
  - Profiles & academics
  - Mark list uploads
  - Exam scores
- Catalog
  - Universities
  - Courses
  - Intake timelines
  - Filters & countries
- Guidance
  - Scholarships
  - Visa checklist
  - Cost calculator
- Applications
  - Application review
  - Eligibility config
- AI
  - AI overview
  - Eligibility checker
  - Recommendations
  - Document analyzer
  - AI chatbot sessions
- Insights
  - Analytics

Active-state behavior:

- Current route gets white background, stronger text, subtle ring/shadow.
- Inactive links use muted text with hover-to-white treatment.

## Page-Level UX Patterns

## 1) Dashboard Pattern

- Page title + short explanatory text at top.
- KPI card grid (countries, universities, courses, students, applications, etc.).
- Cards are tappable links where drill-down exists.
- Secondary information blocks:
  - Design notes (system behavior and data model guidance)
  - Quick links (pill-style shortcuts)

## 2) Data Table Pattern

Used for list-heavy operational screens such as students/exams/scholarships.

- Title + optional description.
- Single bordered table container with:
  - Uppercase compact headers
  - Hover-highlighted rows
  - Empty-state row ("No rows yet.")
  - Graceful fallback for null values (`—`)
- Cell behavior supports wrapping and constrained max width for long values.

### Table component (`Table`)

- Shared table behavior is standardized through the `Table` component (and the education `DataTablePresenter` wrapper).
- Expected API surface:
  - `title` for page-level table heading
  - `description` for context/subtitle
  - `columns` as header + accessor mapping
  - `rows` as normalized list data
  - `emptyLabel` for empty-state messaging
- UX contract for all table screens:
  - Keep headers concise and scannable
  - Preserve row hover feedback for readability
  - Render null/undefined values with a consistent placeholder (`—`)
  - Support wrapped content for long text fields without breaking layout
- Recommendation: new tabular screens should reuse `Table` before introducing custom table UI.

## 3) AI Overview Pattern

- Intro paragraph framing AI as observable/auditable workflows.
- 4 summary metric cards for recent activity (7-day windows).
- Capability cards linking to each AI sub-workflow page.

## 4) Access Guard Pattern

- Education pages use a safe loader wrapper.
- If access check fails, users get a warning notice panel instead of a crash.
- Notice includes:
  - Human-readable reason
  - SQL hint for granting education admin access
  - Link back to home

## Interaction and Component Conventions

- Predominantly neutral grayscale palette with status colors reserved for notices.
- Card geometry:
  - Rounded corners (`lg` to `xl`)
  - Thin gray borders
  - Soft shadows
- Buttons:
  - Variant-based system (`default`, `outline`, `secondary`, etc.)
  - Small utility actions (for example sign-out) use low-emphasis outline style
- Link-driven navigation is preferred over button-heavy controls for primary flow.

## UX Principles Reflected in Current Implementation

- **Operational clarity first**: direct labels and explicit route names.
- **Scannable hierarchy**: compact nav groups, concise headings, card/table blocks.
- **Progressive drill-down**: dashboard metrics and shortcuts route into detailed views.
- **Guardrails over failure**: access issues render guidance instead of blank/error pages.
- **Consistent containment**: nearly all content sits inside bordered cards or table frames.
