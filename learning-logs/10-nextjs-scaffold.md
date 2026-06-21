# Task 10 — Next.js Frontend Scaffold

## What this task covers
Setting up the Next.js app with TypeScript, Tailwind CSS, and the folder structure for all components.

---

## What is Next.js?
Next.js is a React framework. React lets you build UIs with components; Next.js adds routing, server-side rendering, and a build system on top of React. We use the **App Router** (introduced in Next.js 13) which organises pages inside an `app/` folder.

---

## What is the App Router?
Each folder inside `app/` becomes a route. A file named `page.tsx` inside that folder is what gets rendered when you visit that URL.

```
app/
└── page.tsx     → renders at "/"
```

`layout.tsx` wraps every page — it's where you put the `<html>` and `<body>` tags, fonts, and global providers.

---

## What is Tailwind CSS?
Tailwind is a utility-first CSS framework. Instead of writing CSS files, you apply pre-built class names directly in your JSX:

```tsx
<div className="flex gap-4 p-6 bg-gray-900 text-white rounded-xl">
```

No CSS files needed for most styling.

---

## What is TypeScript?
TypeScript adds types to JavaScript. It catches bugs before you run the code — for example, if you pass a number where a string is expected, it errors at compile time, not at runtime.

---

## What is Recharts?
Recharts is a React charting library built on SVG. We'll use it for the latency bar chart and cost bar chart in the results view.

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
```

---

## Folder structure created

```
frontend/
├── app/
│   ├── layout.tsx      ← html/body wrapper, global font
│   ├── page.tsx        ← main page (will hold PromptInput + ResultsGrid)
│   └── globals.css     ← Tailwind base styles
├── components/         ← one file per UI component (tasks 11–15)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## How to run the frontend locally

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`.
